// src/pages/api/createDao.ts

import { SplGovernance } from "governance-idl-sdk";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { jsonResponse, reportError } from './cfPagesFunctionsUtils';
import { isApiKeyValid } from '../services/apiKeyService';
import { drizzle } from "drizzle-orm/d1";
import BN from "bn.js";
import bs58 from "bs58";


type ENV = {
  RPC_URL: string;
  DB: D1Database;
  VITE_ENVIRONMENT_TYPE?: string;
  PRIVATE_KEY: string
}

interface CreateDaoRequest {
  name: string;
  communityTokenMint: string; // PublicKey as string
  minCommunityWeightToCreateGovernance?: number;
  communityTokenType?: "liquid" | "membership" | "dormant";
  councilTokenType?: "liquid" | "membership" | "dormant";
  councilTokenMint?: string; // Optional PublicKey as string
  communityMintMaxVoterWeightSourceType?: "absolute" | "supplyFraction";
  communityMintMaxVoterWeightSourceValue?: number;
}

export const onRequestPost: PagesFunction<ENV> = async (ctx) => {
  const db = drizzle(ctx.env.DB, { logger: true });
  try {
    // authorize request
    // if (!await isApiKeyValid({ ctx, permissions: ['write'] })) {
    //   return jsonResponse(null, 401);
    // }

    const connection = new Connection(ctx.env.RPC_URL);
    const governanceProgramId = new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");

    const splGovernance = new SplGovernance(
      connection,
      governanceProgramId
    );

    const requestBody: CreateDaoRequest = await ctx.request.json();

    const {
      name,
      communityTokenMint,
      minCommunityWeightToCreateGovernance = 10000000000,
      communityTokenType = "liquid",
      councilTokenType = "dormant",
      councilTokenMint,
      communityMintMaxVoterWeightSourceType = "supplyFraction",
      communityMintMaxVoterWeightSourceValue = 10000000000,
    } = requestBody;

    // Convert string addresses to PublicKey
    const communityTokenMintPubKey = new PublicKey(communityTokenMint);
    const councilTokenMintPubKey = councilTokenMint ? new PublicKey(councilTokenMint) : undefined;

    const privateKeyString = ctx.env.PRIVATE_KEY;
    if (!privateKeyString || typeof privateKeyString !== 'string') {
      throw new Error('Invalid private key format');
    }

    // Convert base58 string to Uint8Array
    const privateKeyUint8Array = bs58.decode(privateKeyString);

    // Initialize your wallet
    const wallet = Keypair.fromSecretKey(privateKeyUint8Array);

    const userWallet = wallet.publicKey.toBase58()
    const payerPubKey = new PublicKey(userWallet);

    // Prepare the MintMaxVoteWeightSource
    const communityMintMaxVoterWeightSource = {
      type: communityMintMaxVoterWeightSourceType,
      amount: new BN(communityMintMaxVoterWeightSourceValue)
    };

    // Create the realm instruction using the correct signature:
    // createRealmInstruction(name, communityTokenMint, minCommunityWeightToCreateGovernance, payer, 
    //                       communityMintMaxVoterWeightSource?, councilTokenMint?, 
    //                       communityTokenType?, councilTokenType?, ...)
    const createRealmInstruction = await splGovernance.createRealmInstruction(
      name,
      communityTokenMintPubKey,
      minCommunityWeightToCreateGovernance,
      payerPubKey,
      communityMintMaxVoterWeightSource,
      councilTokenMintPubKey,
      communityTokenType,
      councilTokenType
    );
    console.log("createRealmInstruction", createRealmInstruction);



    const realmPubKey = createRealmInstruction.keys[0].pubkey;

    console.log("Creating governance instruction with:");
    console.log("realmPubKey:", realmPubKey.toBase58());
    console.log("payerPubKey:", payerPubKey.toBase58());
    console.log("councilTokenMintPubKey:", councilTokenMintPubKey ? councilTokenMintPubKey.toBase58() : "undefined");

    const createGovernanceInstruction = await splGovernance.createGovernanceInstruction(
      {
        communityVoteThreshold: { yesVotePercentage: [50] },
        minCommunityWeightToCreateProposal: minCommunityWeightToCreateGovernance,
        minTransactionHoldUpTime: 0,
        votingBaseTime: 216000,
        communityVoteTipping: { disabled: {} },
        councilVoteThreshold: { disabled: {} },
        councilVetoVoteThreshold: { disabled: {} },
        minCouncilWeightToCreateProposal: 1,
        councilVoteTipping: { strict: {} },
        communityVetoVoteThreshold: { disabled: {} },
        votingCoolOffTime: 43200,
        depositExemptProposalCount: 10,
      },
      realmPubKey,
      payerPubKey,
      undefined,
      payerPubKey
    );
    console.log("createGovernanceInstruction", createGovernanceInstruction);

    // Extract governance public key from the governance instruction
    const governancePubKey = createGovernanceInstruction.keys[1].pubkey;

    const createNativeTreasuryInstruction = await splGovernance.createNativeTreasuryInstruction(
      governancePubKey, // Use governance public key instead of realm public key
      payerPubKey
    );
    console.log("createNativeTreasuryInstruction", createNativeTreasuryInstruction);

    // Create the transaction with only the first 3 instructions
    const transaction2 = new Transaction().add(
        createRealmInstruction, 
        createGovernanceInstruction, 
        createNativeTreasuryInstruction
    );

    // Create the transaction and set the blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction2.recentBlockhash = blockhash;
    transaction2.feePayer = payerPubKey; // Set the fee payer
    console.log("transaction2", transaction2);
    console.log("transaction2", transaction2.serialize({ requireAllSignatures: false }).toString('base64'));

    // Sign the transaction
    transaction2.sign(wallet);

    // Send the transaction
    const txSignature2 = await connection.sendRawTransaction(transaction2.serialize(), { skipPreflight: false, preflightCommitment: 'confirmed' });

    if (txSignature2) {
      // Update the database with the DAO address (realm address)
      try {
        await ctx.env.DB
          .prepare("UPDATE tokens SET dao = ? WHERE mint = ?")
          .bind(realmPubKey.toBase58(), communityTokenMint)
          .run();
        console.log(`Updated token ${communityTokenMint} with DAO address: ${realmPubKey.toBase58()}`);
      } catch (dbError) {
        console.error("Error updating database with DAO address:", dbError);
        // Don't fail the entire request if DB update fails, just log it
      }

      return jsonResponse({
        success: true,
        txSignature2: txSignature2,
        realmAddress: realmPubKey.toBase58(),
        governanceAddress: governancePubKey.toBase58(),
      }, 200);
    }

    // Return the transaction for the client to sign and send
    // In a real implementation, you might want to serialize the transaction
    return jsonResponse({
      message: "DAO creation transaction prepared successfully!",
      transaction: transaction2.serialize({ requireAllSignatures: false }).toString('base64'),
      realmName: name
    }, 200);

  } catch (e) {
    console.error("Error creating DAO:", e);
    await reportError(ctx.env.DB, e);
    return jsonResponse({ message: "Something went wrong creating the DAO..." }, 500);
  }
};

export const onRequestOptions: PagesFunction<ENV> = async (ctx) => {
  try {
    if (ctx.env.VITE_ENVIRONMENT_TYPE !== "develop") return;
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return jsonResponse({ message: error }, 500);
  }
};
