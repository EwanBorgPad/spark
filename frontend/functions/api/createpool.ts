// src/pages/api/createToken.ts

import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import bs58 from "bs58";
import { PinataSDK } from "pinata";



const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID as string;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY as string;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID as string;
const R2_BUCKET = process.env.R2_BUCKET as string;
// const RPC_URL = process.env.RPC_URL as string;
// const POOL_CONFIG_KEY = process.env.POOL_CONFIG_KEY as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string; // Base64 encoded private key

const PRIVATE_R2_URL = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const PUBLIC_R2_URL = 'https://pub-85c7f5f0dc104dc784e656b623d999e5.r2.dev';

type ENV = {
  RPC_URL: string
  POOL_CONFIG_KEY: string
  PRIVATE_KEY: string
  BUCKET: R2Bucket
  R2: R2Bucket
  PINATA_JWT: string
}


interface CreatePoolRequest {
  tokenName: string;
  tokenSymbol: string;
  imageUrl: string;
  tokenDescription: string;
}

export const onRequestPost = async (context: { request: Request, env: ENV }): Promise<Response> => {
  const request = context.request; // Extract the request from context

  try {
    const { tokenName, tokenSymbol, imageUrl, tokenDescription } = await request.json() as CreatePoolRequest;

    // Validate required fields
    if (!imageUrl || !tokenName || !tokenSymbol || !tokenDescription) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }


    const keyPair = Keypair.generate();
    const mint = keyPair.publicKey.toBase58();

    // // Upload image and metadata
    // const imageUrl = await uploadImage(tokenLogo, mint);
    // if (!imageUrl) {
    //   return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    const metadataUrl = await uploadMetadata(context, { tokenName, tokenSymbol, mint, image: imageUrl, description: tokenDescription });
    if (!metadataUrl) {
      return new Response(JSON.stringify({ error: 'Failed to upload metadata' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const privateKeyString = context.env.PRIVATE_KEY;

    if (!privateKeyString || typeof privateKeyString !== 'string') {
      throw new Error('Invalid private key format');
    }

    // Convert base58 string to Uint8Array
    const privateKeyUint8Array = bs58.decode(privateKeyString);

    // Initialize your wallet
    const wallet = Keypair.fromSecretKey(privateKeyUint8Array);

    const userWallet = wallet.publicKey.toBase58()

    // Create pool transaction
    const poolTx = await createPoolTransaction({
      mint,
      tokenName,
      tokenSymbol,
      metadataUrl,
      userWallet,
    }, context);

    // Sign the transaction with the private key
    // try {
    //   const trimmedPrivateKey = PRIVATE_KEY.trim(); // Trim whitespace
    //   console.log("Encoded private key:", trimmedPrivateKey); // Log the private key

    //   const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(atob(trimmedPrivateKey))));
    //   poolTx.sign(keypair);
    // } catch (error) {
    //   console.error('Error decoding private key:', error);
    //   return new Response(JSON.stringify({ error: 'Invalid private key' }), {
    //     status: 400,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    poolTx.sign(wallet, keyPair);
    // Send transaction
    const connection = new Connection(context.env.RPC_URL, 'confirmed');
    const txSignature = await connection.sendRawTransaction(poolTx.serialize(), { skipPreflight: false, preflightCommitment: 'confirmed' });

    return new Response(JSON.stringify({
      success: true,
      tokenAddress: mint,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function uploadMetadata(
  context: { env: { BUCKET?: R2Bucket; R2?: R2Bucket; PINATA_JWT: string } },
  params: { tokenName: string; tokenSymbol: string; mint: string; image: string, description: string }
): Promise<string | false> {
  const metadata = {
    name: params.tokenName,
    symbol: params.tokenSymbol,
    description: params.description,
    image: params.image,
  };
  const fileName = `metadata/${params.mint}.json`;

  try {
    // Convert metadata to JSON string
    const jsonString = JSON.stringify(metadata, null, 2);

    const fileBuffer = new TextEncoder().encode(jsonString); // Create a Uint8Array from the JSON string
    const file = new File([fileBuffer], fileName, { type: 'application/json' });

    const pinata = new PinataSDK({
      pinataJwt: context.env.PINATA_JWT,
      pinataGateway: "amethyst-imperial-yak-2.mypinata.cloud",
    });
    const upload = await pinata.upload.public.file(file);


    // Convert JSON string to a buffer

    // Access the R2 bucket
    // const bucket = context.env.BUCKET || context.env.R2; // Ensure you have the correct bucket binding
    // if (!bucket) {
    //   throw new Error('No R2 bucket binding available in the environment');
    // }

    // // Upload using bucket.put
    // await bucket.put(fileName, fileBuffer, {
    //   httpMetadata: {
    //     contentType: 'application/json',
    //   },
    // });
    // console.log(`Metadata uploaded to R2: ${PUBLIC_R2_URL}/${fileName}`);

    return `${PUBLIC_R2_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return false;
  }
}

// async function uploadToR2(fileBuffer: Buffer, contentType: string, fileName: string): Promise<void> {
//   // R2 client setup
//   const r2 = new S3({
//     endpoint: PRIVATE_R2_URL,
//     accessKeyId: R2_ACCESS_KEY_ID,
//     secretAccessKey: R2_SECRET_ACCESS_KEY,
//     region: 'auto',
//     signatureVersion: 'v4',
//   });
//   return new Promise((resolve, reject) => {
//     r2.putObject(
//       {
//         Bucket: R2_BUCKET,
//         Key: fileName,
//         Body: fileBuffer,
//         ContentType: contentType,
//       },
//       (err) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       }
//     );
//   });
// }

async function createPoolTransaction({ mint, tokenName, tokenSymbol, metadataUrl, userWallet }: { mint: string; tokenName: string; tokenSymbol: string; metadataUrl: string; userWallet: string; }, ctx: { env: { RPC_URL: string, POOL_CONFIG_KEY: string } }) {

  const RPC_URL = ctx.env.RPC_URL as string;
  const POOL_CONFIG_KEY = ctx.env.POOL_CONFIG_KEY as string;
  // console.log("RPC_URL:", RPC_URL);
  // console.log("POOL_CONFIG_KEY:", POOL_CONFIG_KEY);
  // console.log("mint:", mint);
  // console.log("userWallet:", userWallet);

  // Validate public keys
  if (!userWallet || !PublicKey.isOnCurve(userWallet)) {
    throw new Error('Invalid user wallet address');
  }

  const connection = new Connection(RPC_URL, 'confirmed');
  const client = new DynamicBondingCurveClient(connection, 'confirmed');

  const poolTx = await client.pool.createPool({
    config: new PublicKey(POOL_CONFIG_KEY),
    baseMint: new PublicKey(mint),
    name: tokenName,
    symbol: tokenSymbol,
    uri: metadataUrl,
    payer: new PublicKey(userWallet),
    poolCreator: new PublicKey(userWallet),
  });

  const { blockhash } = await connection.getLatestBlockhash();
  poolTx.feePayer = new PublicKey(userWallet);
  poolTx.recentBlockhash = blockhash;

  return poolTx;
}