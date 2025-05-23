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


    // // You might also want to create governance and treasury
    // const realmAccount = await splGovernance.getRealmByName(name);
    // console.log("realmAccount", realmAccount);

    // const createGovernanceInstruction = await splGovernance.createGovernanceInstruction(
    //   config: GovernanceConfig, 
    //   realmAccount: PublicKey, 
    //   governanceAuthority: PublicKey, 
    //   tokenOwnerRecord: PublicKey | undefined, 
    //   payer: PublicKey, 
    //   governanceAccountSeed?: PublicKey, 
    //   voterWeightRecord?: PublicKey
    // );

    // const createNativeTreasuryInstruction = await splGovernance.createNativeTreasuryInstruction(
    //     realmAccount,
    //     payerPubKey
    // );

    // const setRealmAuthorityInstruction = await splGovernance.setRealmAuthorityInstruction(
    //     realmAccount,
    //     payerPubKey,
    //     'SetChecked'
    // );

    // Fetch the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create the transaction and set the blockhash
    const transaction = new Transaction().add(createRealmInstruction);
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPubKey; // Set the fee payer

    // Sign the transaction
    transaction.sign(wallet);

    // Send the transaction
    const txSignature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: false, preflightCommitment: 'confirmed' });

    if (txSignature) {
      return jsonResponse({
        success: true,
        txSignature: txSignature,
      }, 200);
    }

    // Return the transaction for the client to sign and send
    // In a real implementation, you might want to serialize the transaction
    return jsonResponse({
      message: "DAO creation transaction prepared successfully!",
      transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64'),
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
