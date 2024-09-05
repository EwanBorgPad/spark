use crate::program::Borgpad;
use crate::state::config::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        space = Config::LEN,
        seeds = [b"config".as_ref()],
        bump,
        payer = deployer
    )]
    pub config: Account<'info, Config>,

    #[account(mut)]
    pub deployer: Signer<'info>,

    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, Borgpad>,

    #[account(constraint = program_data.upgrade_authority_address == Some(deployer.key()))]
    pub program_data: Account<'info, ProgramData>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<Initialize>,
    admin_authority: Pubkey,
    whitelist_authority: Pubkey,
) -> Result<()> {
    let config_data: &mut Account<Config> = &mut ctx.accounts.config;
    config_data.initialize(admin_authority, whitelist_authority, ctx.bumps.config);

    Ok(())
}
