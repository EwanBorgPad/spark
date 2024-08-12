use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::state::position::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{set_authority, SetAuthority};
use anchor_spl::token::spl_token::instruction::AuthorityType;
use anchor_spl::token_interface::{
    mint_to, transfer_checked, Mint, MintTo, TokenAccount, TokenInterface, TransferChecked,
};

#[derive(Accounts)]
pub struct UserDeposit<'info> {
    #[account(
        mut,
        constraint = config.whitelist_authority == whitelist_authority.key() @ ErrorCode::NotWhitelistAuthority
    )]
    pub whitelist_authority: Signer<'info>,

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
        init,
        space = Position::LEN,
        seeds = [
            b"position".as_ref(),
            position_mint.key().as_ref()
        ],
        bump,
        payer = user
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
        init,
        payer = user,
        mint::authority = lbp,
        mint::decimals = 0,
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

pub fn handler(ctx: Context<UserDeposit>, amount: u64) -> Result<()> {
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

    if ctx.accounts.lbp_raised_token_ata.amount + amount > lbp_data.raised_token_max_cap {
        return err!(ErrorCode::MaxCapReached);
    }

    // Transfer funds from user to lbp
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.user_raised_token_ata.to_account_info(),
                to: ctx.accounts.lbp_raised_token_ata.to_account_info(),
                mint: ctx.accounts.raised_token_mint.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.raised_token_mint.decimals,
    )?;

    // Mint position IOU
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.position_mint.to_account_info(),
                to: ctx.accounts.user_position_ata.to_account_info(),
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

    let position_data: &mut Account<Position> = &mut ctx.accounts.position;
    position_data.initialize(ctx.accounts.position_mint.key(), amount, ctx.bumps.position);

    Ok(())
}
