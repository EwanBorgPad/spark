use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(lbp_initialize: LbpInitializeData)]
pub struct InitializeLbp<'info> {
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
        init,
        space = Lbp::LEN,
        seeds = [
        b"lbp".as_ref(),
        &lbp_initialize.uid.to_le_bytes()
        ],
        bump,
        payer = admin_authority
    )]
    pub lbp: Account<'info, Lbp>,

    #[account(
        init_if_needed,
        payer = admin_authority,
        associated_token::mint = raised_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_raised_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = admin_authority,
        associated_token::mint = launched_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_launched_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = lbp_initialize.raised_token_mint == raised_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub raised_token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp_initialize.launched_token_mint == launched_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub launched_token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeLbp>, lbp_initialize: LbpInitializeData) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;
    lbp_data.initialize(
        lbp_initialize,
        ctx.accounts.launched_token_mint.key(),
        ctx.accounts.raised_token_mint.key(),
    );

    Ok(())
}
