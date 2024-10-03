use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    Mint, TokenAccount, TokenInterface,
};

use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;

#[derive(Accounts)]
pub struct MoveToRefundPhase<'info> {
    #[account(
        mut,
        constraint = config.admin_authority == admin_authority.key() @ ErrorCode::NotAdminAuthority
    )]
    pub admin_authority: Signer<'info>,

    #[account(
        seeds = [b"config".as_ref()],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [
            b"lbp".as_ref(),
            &lbp.uid.to_le_bytes()
        ],
        bump
    )]
    pub lbp: Box<Account<'info, Lbp>>,

    #[account(
        mut,
        associated_token::mint = launched_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub launched_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = raised_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub raised_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = lbp.launched_token_mint == launched_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub launched_token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.raised_token_mint == raised_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub raised_token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MoveToRefundPhase>) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;
    if lbp_data.phase != Phase::FundCollection
        || ctx.accounts.raised_token_ata.amount >= lbp_data.raised_token_min_cap
    {
        return err!(ErrorCode::InvalidPhaseChange);
    }

    lbp_data.phase = Phase::Refund;

    Ok(())
}
