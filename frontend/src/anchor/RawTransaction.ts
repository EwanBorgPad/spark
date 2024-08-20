import { Connection, PublicKey, sendAndConfirmTransaction, Transaction, TransactionInstruction } from "@solana/web3.js"

export async function testAnchorRawTransaction () {
  // Define your program ID and the accounts involved
  const programId = new PublicKey("YourProgramPubkeyHere");

  // Define the accounts to be used in the instruction
  const account1 = new PublicKey("Account1PubkeyHere");
  const account2 = new PublicKey("Account2PubkeyHere");

  // Create an instruction
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: account1, isSigner: false, isWritable: true },
      { pubkey: account2, isSigner: true, isWritable: false }
    ],
    programId,
    data: Buffer.alloc(0), // Add any instruction-specific data here
  });

  // Establish a connection to the Solana cluster
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  // Get the payer's account (e.g., from a wallet)
  const payer = /* Load your payer's keypair here */'';

  // Create the transaction
  const transaction = new Transaction().add(instruction);

  // Send the transaction
  const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
  console.log("Transaction confirmed with signature:", signature);
}
