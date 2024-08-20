import { AnchorProvider, BN, Idl, Program, setProvider } from "@coral-xyz/anchor"
import {
  clusterApiUrl,
  Connection, Keypair,
  PublicKey, sendAndConfirmTransaction, SendTransactionError, SystemProgram, Transaction,
} from "@solana/web3.js"
import idl from "./idl.json";
import { Buffer } from 'buffer'
window.Buffer = Buffer

type CustomIdl = typeof idl


export async function testAnchorJson() {
  console.log('testing anchor')

  const devnetExampleLbp = 'BpWYQLwzJDJYB9awK5JYDrH7v6HcwkYuBeWeSpL17KDh'
  const programId = new PublicKey('bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4') // solana program
  const me = '5oY4RHVH4PBS3YDCuQ86gnaM27KvdC9232TpB71wLi1W'

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
  const publicKey = new PublicKey(me)

  const projectOwner = publicKey
  const projectTokenMint = publicKey
  const userTokenMint = publicKey
  const adminKey = publicKey

  idl.address = 'bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4' // lpb-deployer program

  //// Set up your provider - Server Code
  // const provider = AnchorProvider.env();
  // setProvider(provider);

  //// Set up your provider - Browser code Code
  // Initialize the wallet provider (e.g., Phantom wallet)
  // @ts-expect-error
  const wallet = window.solana; // For Phantom wallet

  if (!wallet) {
    throw new Error('Wallet not connected');
  }

  // Create the AnchorProvider
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  //   const programId = new PublicKey('YourProgramID');

  // Load the IDL (Interface Description Language) for your program
  // Create the Program instance
  const program = new Program(idl as Idl, provider);

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program.programId
  );

  const [lbpPda] = PublicKey.findProgramAddressSync(
    // TODO find out why this variant doesn't work, and why the new one below does
    // [Buffer.from('lbp'), new Uint8Array([1])],
    [Buffer.from('lbp'), Buffer.from(new Uint8Array(new BN(1).toArray('le', 8)))],
    program.programId
  );

  // console.log('before call')
  // console.log({ wallet })

  const secretArr = '229,210,59,193,148,11,159,124,76,61,19,192,187,57,116,248,106,122,236,109,44,227,111,7,8,239,245,250,73,201,209,2,114,47,54,40,69,185,77,76,215,145,49,228,111,145,243,69,183,140,50,221,157,144,34,153,164,159,111,200,91,249,221,96'.split(',').map(Number)
  const adminKeypair = Keypair.fromSecretKey(new Uint8Array(secretArr))
  const adminPublicKey = adminKeypair.publicKey
  const adminSecretKey = adminKeypair.secretKey

  //// KeyPair Generation, use this for testing
  // const adminKeypair = Keypair.generate();
  // const adminPublicKey = adminKeypair.publicKey;
  // const adminSecretKey = adminKeypair.secretKey;

  console.log({ adminPublicKey: adminPublicKey.toString() })
  // console.log({ adminSecretKey: adminSecretKey.toString() })

  // Send the transaction
  const tx = await program.methods
    .initializeLbp({
      uid: new BN(1),
      projectOwner,
      projectTokenMint,
      projectTokenLpDistribution: 50, // Example percentage
      projectMaxCap: new BN(1000000),
      userTokenMint,
      userMinCap: new BN(100),
      userMaxCap: new BN(10000),
      fundCollectionPhaseStartTime: new BN(1699999999),
      fundCollectionPhaseEndTime: new BN(1700009999),
      lpLockedPhaseLockingTime: new BN(1700019999),
      lpLockedPhaseVestingTime: new BN(1700029999),
      bump: 1,
    })
    .accounts({
      config: configPda,
      lbp: lbpPda,
      admin: adminPublicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([{ publicKey: adminPublicKey, secretKey: adminSecretKey }]) // Add any additional signers here if needed
    .transaction();

  tx.feePayer = adminPublicKey

  ///// Attempts to serialize the transaction for debugging purposes
  // tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
  // tx.feePayer = adminPublicKey
  // tx.sign(adminKeypair)
  // // Serialize the transaction to get the raw data
  // const rawTransaction = tx.serialize();
  // // Convert to Base64 for easier viewing
  // const base64Transaction = rawTransaction.toString('base64');
  // console.log("Raw Transaction (Base64):", base64Transaction);
  // serializeTx(base64Transaction)

  await sendAndConfirmTransaction(connection, tx, [adminKeypair])

  // try {
  //   await sendAndConfirmTransaction(connection, tx, [adminKeypair])
  // } catch (e: SendTransactionError) {
  //   const logs  = await e.getLogs(connection)
  //   console.log({ message: e.message })
  //   console.log({ lgos: e.logs })
  //   console.log({ logs })
  // }
}

// testAnchorJson().then(_ => console.log('finished')).catch(console.error)

function serializeTx(base64Tx: string) {
// Convert the Base64 string back to a Buffer
  const rawTransactionBuffer = Buffer.from(base64Tx, 'base64');

// Deserialize the transaction
  const transaction = Transaction.from(rawTransactionBuffer);

// Inspect the transaction
  console.log("Signatures:", transaction.signatures);
  console.log("Message:", transaction.compileMessage());

// Get readable information from the message
  const message = transaction.compileMessage();
  console.log("Instructions:", message.instructions.map(ix => ({
  // @ts-ignore
    programId: ix.programId?.toString(),
    // @ts-ignore
    accounts: ix.keys?.map(key => key.pubkey.toString()),
    data: ix.data?.toString('hex'),  // You can further decode this if needed
  })));

  console.log("Recent Blockhash:", message.recentBlockhash);
  console.log("Fee Payer:", message.accountKeys[0].toString());
}
