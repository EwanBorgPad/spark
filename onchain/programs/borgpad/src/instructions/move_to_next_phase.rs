use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    mint_to, transfer_checked, Mint, MintTo, TokenAccount, TokenInterface, TransferChecked,
};

use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::state::position::*;

#[derive(Accounts)]
pub struct MoveToNextPhase<'info> {
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
        seeds = [
        b"lbp".as_ref(),
        & lbp.uid.to_le_bytes()
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
        constraint = lbp.launched_token_mint == launched_token_mint.key() @ ErrorCode::IncorrectMint
    )]
    pub launched_token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.raised_token_mint == raised_token_mint.key() @ ErrorCode::IncorrectMint
    )]
    pub raised_token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<MoveToNextPhase>, phase: Phase) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;
    let time = Clock::get()?.unix_timestamp as u64;

    match phase {
        Phase::FundCollection => {
            return err!(ErrorCode::InvalidPhaseChange);
        }
        Phase::Refund => {
            if lbp_data.phase == Phase::FundCollection
                && time > lbp_data.fund_collection_end_time
                && ctx.accounts.raised_token_ata.amount < lbp_data.raised_token_min_cap
            {
                // TODO: phase change logic
            } else {
                return err!(ErrorCode::InvalidPhaseChange);
            }
        }
        Phase::Cliff => {
            if lbp_data.phase == Phase::FundCollection
                && time > lbp_data.fund_collection_end_time
                && ctx.accounts.raised_token_ata.amount > lbp_data.raised_token_min_cap
            {
                // TODO: phase change logic
            } else {
                return err!(ErrorCode::InvalidPhaseChange);
            }
        }
        Phase::Vesting => {
            if (lbp_data.phase == Phase::Cliff
                && time > lbp_data.cliff_start_time + lbp_data.cliff_duration)
                || (lbp_data.phase == Phase::FundCollection
                    && lbp_data.cliff_duration == 0u64
                    && time > lbp_data.fund_collection_end_time
                    && ctx.accounts.raised_token_ata.amount > lbp_data.raised_token_min_cap)
            {
                // TODO: phase change logic
            } else {
                return err!(ErrorCode::InvalidPhaseChange);
            }
        }
        Phase::Finished => {
            if (lbp_data.phase == Phase::Vesting
                && time
                    > lbp_data.cliff_start_time
                        + lbp_data.cliff_duration
                        + lbp_data.vesting_duration)
                || (lbp_data.phase == Phase::Cliff
                    && lbp_data.vesting_duration == 0u64
                    && time > lbp_data.cliff_start_time + lbp_data.cliff_duration)
            {
                // TODO: phase change logic
            } else {
                return err!(ErrorCode::InvalidPhaseChange);
            }
        }
    }

    // transfer_checked(
    //     CpiContext::new(
    //         ctx.accounts.token_program.to_account_info(),
    //         TransferChecked {
    //             from: ctx.accounts.user_token_ata.to_account_info(),
    //             to: ctx.accounts.lbp_token_ata.to_account_info(),
    //             mint: ctx.accounts.token_mint.to_account_info(),
    //             authority: ctx.accounts.user.to_account_info(),
    //         },
    //     ),
    //     amount,
    //     ctx.accounts.token_mint.decimals,
    // )?;

    Ok(())
}
