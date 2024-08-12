use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::state::position::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{burn, Burn, close_account, CloseAccount};
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
pub struct UserRefund<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [b"config".as_ref()],
        bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        seeds = [
            b"lbp".as_ref(),
            & lbp.uid.to_le_bytes()
        ],
        bump
    )]
    pub lbp: Box<Account<'info, Lbp>>,

    #[account(
        mut,
        close = user,
        seeds = [
            b"position".as_ref(),
            position_mint.key().as_ref()
        ],
        bump,
        constraint = position.lbp == lbp.key() @ ErrorCode::InvalidPosition
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        associated_token::mint = position_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_position_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = raised_token_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_raised_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = raised_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_raised_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        constraint = position.mint == position_mint.key() @ ErrorCode::InvalidMint
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.raised_token_mint == raised_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub raised_token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<UserRefund>) -> Result<()> {
    let position_data: & Account<Position> = & ctx.accounts.position;

    if ctx.accounts.lbp.phase != Phase::Refund {
        return err!(ErrorCode::UnauthorisedOperationInCurrentPhase)
    }

    if ctx.accounts.user_position_ata.amount != 1 {
        return err!(ErrorCode::DoesNotHoldPosition)
    }

    // Transfer funds from lbp to users
    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.lbp_raised_token_ata.to_account_info(),
                to: ctx.accounts.user_raised_token_ata.to_account_info(),
                mint: ctx.accounts.raised_token_mint.to_account_info(),
                authority: ctx.accounts.lbp.to_account_info(),
            },
            &[&[b"lbp", &ctx.accounts.lbp.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
        position_data.amount,
        ctx.accounts.raised_token_mint.decimals,
    )?;

    // Burn token
    burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.position_mint.to_account_info(),
                from: ctx.accounts.user_position_ata.to_account_info(),
                authority: ctx.accounts.lbp.to_account_info(),
            },
            &[&[b"lbp", &ctx.accounts.lbp.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
        1,
    )?;

    // Close ata
    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.user_position_ata.to_account_info(),
                destination: ctx.accounts.user.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            }
        )
    )?;

    // TODO: use token2022 to close the mint as well

    Ok(())
}
