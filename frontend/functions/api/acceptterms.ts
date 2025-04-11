import { Connection, PublicKey } from "@solana/web3.js"
import nacl from "tweetnacl"
import { decodeUTF8 } from "tweetnacl-util"
import bs58 from "bs58"

import { AcceptTermsRequestSchema, UserModelJson } from "../../shared/models"
import { jsonResponse, reportError } from "./cfPagesFunctionsUtils"
import { UserService } from "../services/userService"

/**
 * Countries that are not allowed to participate.
 * Countries in this list will be denied access.
 * Countries are listed as ISO 3166 A2 country codes (two-letter country codes)
 * List of codes: https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
 */
const COUNTRIES_BLACKLIST: string[] = [
  "BY", // Belarus
  "BI", // Burundi
  "CF", // Central African Republic
  "CD", // Democratic Republic of Congo
  "KP", // Democratic People’s Republic of Korea (North Korea)
  "UA", // Temporarily occupied regions of Ukraine
  "CU", // Cuba
  "IR", // Iran
  "LY", // Libya
  "CN", // People's Republic of China
  "RU", // Russian Federation
  "SO", // Somalia
  "SD", // Sudan
  "SS", // South Sudan
  "SY", // Syria
  "US", // United States of America
  "VE", // Venezuela
  "YE", // Yemen
  "ZW"  // Zimbabwe
]
// @TODO - fix Ukraine country blacklist with blacklisted regions below
// const BLACKLISTED_REGIONS: string[] = ['UA-43', 'UA-40', 'UA-14', 'UA-09']

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
    const { error, data } = AcceptTermsRequestSchema.safeParse(requestJson)

    if (error) {
      return jsonResponse(null, 400)
    }

    ///// authorization
    const { publicKey, message, signature, isLedgerTransaction } = data
    const address = publicKey

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
      
      if (!isVerified) {
        await reportError(db, new Error(`Invalid signature (acceptterms)! publicKey: ${publicKey}, message: ${message}, signature: ${signature}`))
        return jsonResponse(null, 401)
      }
    }

    //// business logic
    // check if the user is stored in the db
    const existingUser = await UserService.findUserByAddress({ db, address })

    const countryOfOrigin = ctx.request.cf?.country ?? 'UnknownCountry'
    const regionOfOrigin = ctx.request.cf?.regionCode
    const region = ctx.request.cf?.region

    if (COUNTRIES_BLACKLIST.includes(countryOfOrigin)) {
      const message = `Access currently denied for country ${countryOfOrigin}.`
      const reportMessage = `Access currently denied for country ${countryOfOrigin}-${regionOfOrigin}-${region}.`
      await reportError(db, new Error(reportMessage))
      return jsonResponse({ message }, 403)
    }

    console.log({ existingUser })

    const termsOfUse = {
      acceptedAt: new Date(),
      acceptedTextSigned: message,
      countryOfOrigin,
    }

    if (!existingUser) {
      console.log("User not found in db, inserting...")
      const json: UserModelJson = { termsOfUse }
      await db
        .prepare("INSERT INTO user (address, json) VALUES (?1, ?2)")
        .bind(address, JSON.stringify(json))
        .run()
      console.log("User inserted into db.")
    } else {
      console.log("User found in db, updating...")

      const json: UserModelJson = existingUser.json ?? {}
      json.termsOfUse = termsOfUse

      await db
        .prepare("UPDATE user SET json = ?2 WHERE address = ?1")
        .bind(address, JSON.stringify(json))
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
