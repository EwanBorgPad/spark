use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::config::*;

#[derive(Accounts)]
pub struct NominateNewAdminAuthority<'info> {
    #[account(
        mut,
        seeds = [b"config".as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        constraint = config.admin_authority == admin_authority.key() @ ErrorCode::NotAdminAuthority
    )]
    pub admin_authority: Signer<'info>,
}

pub fn handler(ctx: Context<NominateNewAdminAuthority>, new_admin_authority: Pubkey) -> Result<()> {
    let config: &mut Account<Config> = &mut ctx.accounts.config;
    config.pending_admin_authority = Some(new_admin_authority);

    Ok(())
}