use std::rc::Rc;
use std::str::FromStr;

use anchor_client::{Client, Cluster, solana_sdk::{
    pubkey,
    signature::read_keypair_file,
    signer::Signer,
    system_program,
    bpf_loader_upgradeable
}};

use borgpad::{accounts, ID, instruction};
use borgpad::state::config::Config;
use borgpad::state::lbp::{Lbp};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // initialize()
    initialize_lbp()
}

fn initialize() -> Result<(), Box<dyn std::error::Error>> {
    let deployer = read_keypair_file("../borgpad-devnet-deployer.json")?;
    let client = Client::new(Cluster::Devnet, Rc::new(deployer.insecure_clone()));
    let program = client.program(ID)?;

    let config_info = pubkey::Pubkey::find_program_address(
        &[b"config".as_ref()],
        &ID,
    );

    let program_data_address = pubkey::Pubkey::find_program_address(
        &[&ID.to_bytes()],
        &bpf_loader_upgradeable::ID,
    ).0;

    program
        .request()
        .accounts(accounts::Initialize {
            config: config_info.0,
            deployer: deployer.pubkey(),
            program: ID,
            program_data: program_data_address,
            system_program: system_program::ID,
        })
        .args(instruction::Initialize { admin_authority: deployer.pubkey(), whitelist_authority: deployer.pubkey() })
        .signer(&deployer)
        .send()?;

    let config_data: Config = program.account(config_info.0)?;
    assert_eq!(config_data.admin_authority, deployer.pubkey());
    assert_eq!(config_data.whitelist_authority, deployer.pubkey());
    assert_eq!(config_data.bump, config_info.1);

    Ok(())
}

fn initialize_lbp() -> Result<(), Box<dyn std::error::Error>> {
    let deployer = read_keypair_file("../borgpad-devnet-deployer.json")?;
    let client = Client::new(Cluster::Devnet, Rc::new(deployer.insecure_clone()));
    let program = client.program(ID)?;

    let config_info = pubkey::Pubkey::find_program_address(
        &[b"config".as_ref()],
        &ID,
    );

    let uid: u64 = 0;

    let lbp_info = pubkey::Pubkey::find_program_address(
        &[b"lbp".as_ref(), &uid.to_le_bytes()],
        &ID,
    );

    // let lbp_static_data = LbpStaticData {
    //     uid,
    //
    //     project_owner: deployer.pubkey(),
    //     project_token_mint: pubkey::Pubkey::from_str("Afn8YB1p4NsoZeS5XJBZ18LTfEy5NFPwN46wapZcBQr6").unwrap(), //devTMAC
    //     project_token_lp_distribution: 50,
    //     project_max_cap: 1000,
    //
    //     user_token_mint: pubkey::Pubkey::from_str("Jd4M8bfJG3sAkd82RsGWyEXoaBXQP7njFzBwEaCTuDa").unwrap(), // devSAMO
    //     user_min_cap: 500,
    //     user_max_cap: 1000,
    //
    //     fund_collection_phase_start_time: 13,
    //     fund_collection_phase_end_time: 42,
    //
    //     lp_locked_phase_locking_time: 69,
    //     lp_locked_phase_vesting_time: 420,
    //
    //     bump: lbp_info.1,
    // };
    //
    // program
    //     .request()
    //     .accounts(accounts::InitializeLbp {
    //         config: config_info.0,
    //         lbp: lbp_info.0,
    //         admin: deployer.pubkey(),
    //         system_program: system_program::ID,
    //     })
    //     .args(instruction::InitializeLbp { lbp_static_data: lbp_static_data.clone() })
    //     .signer(&deployer)
    //     .send()?;
    //
    // let lbp_data: Lbp = program.account(lbp_info.0)?;
    // assert_eq!(lbp_data.static_data, lbp_static_data);
    // assert_eq!(lbp_data.dynamic_data, LbpDynamicData {project_cap: 0, user_cap: 0, lp_locked_phase_start_time: 0 });

    Ok(())
}