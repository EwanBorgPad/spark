use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;

#[derive(Accounts)]
#[instruction(lbp_static_data: LbpStaticData)]
pub struct InitializeLbp<'info> {
    #[account(
        mut,
        constraint = config.admin_authority == admin_authority.key() @ ErrorCode::NotAdmin
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
        &lbp_static_data.uid.to_le_bytes()
        ],
        bump,
        payer = admin_authority
    )]
    pub lbp: Account<'info, Lbp>,

    #[account(
        init_if_needed,
        payer = admin_authority,
        associated_token::mint = token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = lbp_static_data.user_token_mint == token_mint.key() @ ErrorCode::IncorrectMint
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<InitializeLbp>, lbp_static_data: LbpStaticData) -> Result<()> {
    let lbp = Lbp { static_data: lbp_static_data, dynamic_data: LbpDynamicData::default() };
    ctx.accounts.lbp.set_inner(lbp);

    Ok(())
}
