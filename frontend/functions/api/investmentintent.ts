import { InvestmentIntentRequestSchema, UserModelJson } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { Connection, PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"
import { UserService } from "../services/userService"
import bs58 from "bs58"


// Use a public RPC endpoint
const RPC_ENDPOINT = "https://solana-mainnet.g.alchemy.com/v2/demo"

type ENV = {
  DB: D1Database
}
export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = ctx.env.DB
  try {
    //// validate request
    const requestJson = await ctx.request.json()
    const { error, data } = InvestmentIntentRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, projectId, amount, message, signature, isLedgerTransaction } = data

    let isVerified = false

    if (isLedgerTransaction) {
      const signatureBase58 = bs58.encode(new Uint8Array(signature))

      try {
        const connection = new Connection(RPC_ENDPOINT)
        const transaction = await waitForTransaction(connection, signatureBase58)

        if (!transaction) {
          console.log("❌ Transaction not found")
          return jsonResponse(null, 400)
        }

        const logMessages = transaction.meta.logMessages;

        const memoLog = logMessages.find(log => log.includes('Program log: Memo'));
        let extractedMessage = null;

        if (memoLog) {
          const matches = memoLog.match(/"([^"]*)"/);
          if (matches && matches[1]) {
            extractedMessage = matches[1];
          }
        }

        const firstAccount = transaction.transaction.message.accountKeys[0];
        const senderPublicKey = firstAccount.pubkey.toString();

        console.log("Message extrait de la transaction:", extractedMessage);
        console.log("Message attendu:", message);
        console.log("Adresse de l'expéditeur (string):", senderPublicKey);
        console.log("Adresse attendue:", publicKey);

        isVerified = extractedMessage === message && senderPublicKey === publicKey;

        if (!isVerified) {
          return jsonResponse(null, 400);
        }

        isVerified = true
      } catch (err) {
        console.error("❌ Error during transaction verification:", err)
        return jsonResponse(null, 500)
      }
    } else {
      isVerified = nacl.sign.detached.verify(
        decodeUTF8(message),
        new Uint8Array(signature),
        new PublicKey(publicKey).toBytes(),
      );
      
      console.log("Signature verification result:", isVerified)
    }
    
    if (!isVerified) {
      await reportError(db, new Error(`Invalid signature (investmentintent)! publicKey: ${publicKey}, message: ${message}, signature: ${signature}`))
      return jsonResponse(null, 401)
    }

    //// business logic
    // check if the user is stored in the db
    const existingUser = await UserService.findUserByAddress({ db, address: publicKey })

    console.log({ existingUser })

    const investmentIntent = { amount, message, signature, providedAt: new Date() }

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = {
        investmentIntent: {
          [projectId]: investmentIntent,
        }
      }
      await db
        .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
        .bind(publicKey, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")

      const json: UserModelJson = existingUser.json ?? {}
      if (!json.investmentIntent) json.investmentIntent = {}
      json.investmentIntent[projectId] = investmentIntent

      await db
        .prepare("UPDATE user SET json = ?2 WHERE address = ?1")
        .bind(publicKey, JSON.stringify(json))
        .run()
      console.log("User updated")
    }

    return jsonResponse(null, 204)
  } catch (e) {
    await reportError(db, e)
    return jsonResponse({ message: "Something went wrong..." }, 500)
  }
}

async function waitForTransaction(connection, signatureBase58, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const transaction = await connection.getParsedTransaction(signatureBase58, { commitment: "confirmed" });
    if (transaction) {
      return transaction;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error("Timeout: Transaction not found");
}
