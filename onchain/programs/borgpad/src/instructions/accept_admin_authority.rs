use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::config::*;

#[derive(Accounts)]
pub struct AcceptAdminAuthority<'info> {
    #[account(
        mut,
        seeds = [b"config".as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        constraint = config.pending_admin_authority == Some(new_admin_authority.key()) @ ErrorCode::NotAdminAuthority
    )]
    pub new_admin_authority: Signer<'info>,
}

pub fn handler(ctx: Context<AcceptAdminAuthority>) -> Result<()> {
    let config: &mut Account<Config> = &mut ctx.accounts.config;
    config.admin_authority = ctx.accounts.new_admin_authority.key();
    config.pending_admin_authority = None;

    Ok(())
}