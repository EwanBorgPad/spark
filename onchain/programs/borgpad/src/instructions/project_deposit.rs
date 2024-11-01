use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
pub struct ProjectDeposit<'info> {
    #[account(
        mut,
        constraint = lbp.project == project.key() @ ErrorCode::NotProject
    )]
    pub project: Signer<'info>,

    #[account(
        seeds = [b"config".as_ref()],
        bump
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds = [
            b"lbp".as_ref(),
            & lbp.uid.to_le_bytes()
        ],
        bump
    )]
    pub lbp: Box<Account<'info, Lbp>>,

    #[account(
        constraint = lbp.launched_token_mint == launched_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub launched_token_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = launched_token_mint,
        associated_token::authority = project,
        associated_token::token_program = token_program,
    )]
    pub project_launched_token_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = launched_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_launched_token_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ProjectDeposit>, amount: u64) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;

    if lbp_data.phase != Phase::FundCollection {
        return err!(ErrorCode::UnauthorisedOperationInCurrentPhase)
    }

    if amount != lbp_data.launched_token_cap {
        return err!(ErrorCode::InvalidAmount)
    }

    if ctx.accounts.lbp_launched_token_ata.amount == lbp_data.launched_token_cap {
        return err!(ErrorCode::MaxCapReached);
    }

    // Transfer funds from project to lbp
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.project_launched_token_ata.to_account_info(),
                to: ctx.accounts.lbp_launched_token_ata.to_account_info(),
                mint: ctx.accounts.launched_token_mint.to_account_info(),
                authority: ctx.accounts.project.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.launched_token_mint.decimals,
    )?;

    Ok(())
}
