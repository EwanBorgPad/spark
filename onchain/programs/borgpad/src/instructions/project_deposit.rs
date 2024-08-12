use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::state::position::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{freeze_account, FreezeAccount, set_authority, SetAuthority};
use anchor_spl::token::spl_token::instruction::AuthorityType;
use anchor_spl::token_interface::{
    mint_to, transfer_checked, Mint, MintTo, TokenAccount, TokenInterface, TransferChecked,
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
        init,
        space = Position::LEN,
        seeds = [
            b"position".as_ref(),
            position_mint.key().as_ref()
        ],
        bump,
        payer = project
    )]
    pub position: Account<'info, Position>,

    #[account(
        mut,
        associated_token::mint = position_mint,
        associated_token::authority = project,
        associated_token::token_program = token_program,
    )]
    pub project_position_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = launched_token_mint,
        associated_token::authority = project,
        associated_token::token_program = token_program,
    )]
    pub project_launched_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = launched_token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_launched_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = project,
        mint::authority = lbp,
        mint::decimals = 0,
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.launched_token_mint == launched_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub launched_token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<ProjectDeposit>, amount: u64) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;
    let time = Clock::get()?.unix_timestamp as u64;

    if lbp_data.phase != Phase::FundCollection {
        return err!(ErrorCode::UnauthorisedOperationInCurrentPhase)
    }

    if time < lbp_data.fund_collection_start_time {
        return err!(ErrorCode::FundCollectionPhaseNotStarted);
    }

    if time > lbp_data.fund_collection_end_time {
        return err!(ErrorCode::FundCollectionPhaseCompleted);
    }

    if ctx.accounts.lbp_launched_token_ata.amount >= lbp_data.launched_token_cap {
        return err!(ErrorCode::MaxCapReached);
    }

    if amount != lbp_data.launched_token_cap {
        return err!(ErrorCode::InvalidAmount)
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

    // Mint position IOU
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.position_mint.to_account_info(),
                to: ctx.accounts.project_position_ata.to_account_info(),
                authority: lbp_data.to_account_info(),
            },
            &[&[b"lbp", &lbp_data.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
        1,
    )?;

    // Remove position mint authority
    set_authority(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            SetAuthority {
                current_authority: lbp_data.to_account_info(),
                account_or_mint: ctx.accounts.position_mint.to_account_info(),
            },
            &[&[b"lbp", &lbp_data.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
        AuthorityType::MintTokens,
        None
    )?;

    // Freeze token transfer
    freeze_account(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            FreezeAccount {
                account: ctx.accounts.project_position_ata.to_account_info(),
                mint: ctx.accounts.position_mint.to_account_info(),
                authority: lbp_data.to_account_info(),
            },
            &[&[b"lbp", &lbp_data.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
    )?;

    let position_data: &mut Account<Position> = &mut ctx.accounts.position;
    position_data.initialize(ctx.accounts.position_mint.key(), ctx.accounts.lbp.key(), amount, ctx.bumps.position);

    Ok(())
}
