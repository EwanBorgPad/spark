use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::Instruction;
use anchor_lang::solana_program::log::sol_log;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    Mint, TokenAccount, TokenInterface,
};

use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::utils::sighash;

#[derive(Accounts)]
pub struct MoveToVestingPhase<'info> {
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
        constraint = lbp.launched_token_mint == launched_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub launched_token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.raised_token_mint == raised_token_mint.key() @ ErrorCode::InvalidMint
    )]
    pub raised_token_mint: InterfaceAccount<'info, Mint>,

    // Raydium accounts

    /// CHECK: unchecked
    pub dex_program_id: UncheckedAccount<'info>,

    /// CHECK: unchecked
    pub amm_config: UncheckedAccount<'info>,

    /// CHECK: unchecked
    pub authority: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub pool_state: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub lp_mint: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub creator_lp_token: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub launched_token_vault: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub raised_token_vault: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub create_pool_fee: UncheckedAccount<'info>,

    /// CHECK: unchecked
    #[account(mut)]
    pub observation_state: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<MoveToVestingPhase>) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;

    if lbp_data.phase != Phase::FundCollection
        || ctx.accounts.raised_token_ata.amount < lbp_data.raised_token_min_cap
        || ctx.accounts.launched_token_ata.amount != lbp_data.launched_token_cap
    {
        return err!(ErrorCode::InvalidPhaseChange);
    }

    let time = Clock::get()?.unix_timestamp as u64;

    lbp_data.phase = Phase::Vesting;
    lbp_data.raised_token_cap = ctx.accounts.raised_token_ata.amount;
    lbp_data.vesting_start_time = time;

    initialize_pool_cpi(ctx)?;

    Ok(())
}

// TODO: It's not possible to initiate the pool with CPI because the account that initialize must not carry data...

pub fn initialize_pool_cpi(ctx: Context<MoveToVestingPhase>) -> Result<()> {
    let (
        token_0_mint,
        token_1_mint,
        creator_token_0,
        creator_token_1,
        token_0_vault,
        token_1_vault,
        init_amount_0,
        init_amount_1
    ) = if ctx.accounts.raised_token_mint.key() < ctx.accounts.launched_token_mint.key() {
        (
            ctx.accounts.raised_token_mint.to_account_info(),
            ctx.accounts.launched_token_mint.to_account_info(),
            ctx.accounts.raised_token_ata.to_account_info(),
            ctx.accounts.launched_token_ata.to_account_info(),
            ctx.accounts.raised_token_vault.to_account_info(),
            ctx.accounts.launched_token_vault.to_account_info(),
            ctx.accounts.lbp.raised_token_cap,
            ctx.accounts.lbp.launched_token_cap,
        )
    } else {
        (
            ctx.accounts.launched_token_mint.to_account_info(),
            ctx.accounts.raised_token_mint.to_account_info(),
            ctx.accounts.launched_token_ata.to_account_info(),
            ctx.accounts.raised_token_ata.to_account_info(),
            ctx.accounts.launched_token_vault.to_account_info(),
            ctx.accounts.raised_token_vault.to_account_info(),
            ctx.accounts.lbp.launched_token_cap,
            ctx.accounts.lbp.raised_token_cap,
        )
    };

    let mut data = Vec::with_capacity(20);
    sighash("global", "initialize").serialize(&mut data)?;
    init_amount_0.serialize(&mut data)?;
    init_amount_1.serialize(&mut data)?;
    0u64.serialize(&mut data)?; // We do not add a delay for trading

    let accounts = vec![
        AccountMeta::new(ctx.accounts.lbp.key(), true),
        AccountMeta::new_readonly(ctx.accounts.amm_config.key(), false),
        AccountMeta::new_readonly(ctx.accounts.authority.key(), false),
        AccountMeta::new(ctx.accounts.pool_state.key(), false),
        AccountMeta::new_readonly(token_0_mint.key(), false),
        AccountMeta::new_readonly(token_1_mint.key(), false),
        AccountMeta::new(ctx.accounts.lp_mint.key(), false),
        AccountMeta::new(creator_token_0.key(), false),
        AccountMeta::new(creator_token_1.key(), false),
        AccountMeta::new(ctx.accounts.creator_lp_token.key(), false),
        AccountMeta::new(token_0_vault.key(), false),
        AccountMeta::new(token_1_vault.key(), false),
        AccountMeta::new(ctx.accounts.create_pool_fee.key(), false),
        AccountMeta::new(ctx.accounts.observation_state.key(), false),
        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.associated_token_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.system_program.key(), false),
        AccountMeta::new_readonly(ctx.accounts.rent.key(), false),
    ];

    let account_infos = [
        ctx.accounts.lbp.to_account_info(),
        ctx.accounts.amm_config.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.pool_state.to_account_info(),
        token_0_mint,
        token_1_mint,
        ctx.accounts.lp_mint.to_account_info(),
        creator_token_0,
        creator_token_1,
        ctx.accounts.creator_lp_token.to_account_info(),
        token_0_vault,
        token_1_vault,
        ctx.accounts.create_pool_fee.to_account_info(),
        ctx.accounts.observation_state.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        ctx.accounts.associated_token_program.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    let instruction = Instruction {
        program_id: ctx.accounts.dex_program_id.key(),
        accounts,
        data,
    };

    invoke_signed(
        &instruction,
        &account_infos,
        &[&[b"lbp", &ctx.accounts.lbp.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
    )?;

    Ok(())
}