use std::rc::Rc;

use anchor_client::{
    solana_sdk::{
        signature::{read_keypair_file, Keypair},
        signer::Signer,
        system_program,
    },
    Client, Cluster,
};
use borgpad::{accounts, instruction, ID};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let payer = read_keypair_file("../borgpad-devnet-deployer.json")?;
    let client = Client::new(Cluster::Localnet, Rc::new(payer));
    let program = client.program(ID)?;

    // TODO: initialize and fetch config account
    // program
    //     .request()
    //     .accounts(accounts::Initialize {
    //         my_account: my_account_kp.pubkey(),
    //         payer: program.payer(),
    //         system_program: system_program::ID,
    //     })
    //     .args(instruction::Initialize { field: 42 })
    //     .signer(&my_account_kp)
    //     .send()?;
    //
    // let my_account: MyAccount = program.account(my_account_kp.pubkey())?;
    // assert_eq!(my_account.field, 42);

    println!("BONKED");

    Ok(())
}
