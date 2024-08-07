use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::config::*;

#[derive(Accounts)]
pub struct SetWhitelistAuthority<'info> {
    #[account(
        mut,
        seeds = [b"config".as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        constraint = config.admin_authority == admin_authority.key() @ ErrorCode::NotAdmin
    )]
    pub admin_authority: Signer<'info>,
}

pub fn handler(ctx: Context<SetWhitelistAuthority>, new_whitelist_authority: Pubkey) -> Result<()> {
    let config: &mut Account<Config> = &mut ctx.accounts.config;
    config.whitelist_authority = new_whitelist_authority;

    Ok(())
}
