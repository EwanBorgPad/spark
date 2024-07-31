use anchor_lang::prelude::*;

use crate::errors::ErrorCode;
use crate::state::config::*;

#[derive(Accounts)]
pub struct SetAdminAuthority<'info> {
    #[account(
        mut,
        seeds = [b"config".as_ref()],
        bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        constraint = config.admin_authority == old_admin_authority.key() @ ErrorCode::NotAdmin
    )]
    pub old_admin_authority: Signer<'info>,

    #[account(
        mut,
        constraint = new_admin_authority.key() != old_admin_authority.key() @ ErrorCode::SameAdmin
    )]
    pub new_admin_authority: Signer<'info>
}

pub fn handler(ctx: Context<SetAdminAuthority>) -> Result<()> {
    let config: &mut Account<Config> = &mut ctx.accounts.config;
    config.admin_authority = ctx.accounts.new_admin_authority.key();

    Ok(())
}
