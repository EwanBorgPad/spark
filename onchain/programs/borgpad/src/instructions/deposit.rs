use anchor_lang::prelude::*;
use anchor_spl::{
    token_interface::{TokenAccount, Mint, TokenInterface, TransferChecked,
                      transfer_checked, mint_to, MintTo},
};
use anchor_spl::associated_token::AssociatedToken;
use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;
use crate::state::position::*;

#[derive(Accounts)]
#[instruction(uid: u64)]
pub struct Deposit<'info> {
    #[account(
        mut,
        constraint = config.whitelist_authority == whitelist_authority.key() @ ErrorCode::NotAdmin
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
        & lbp.static_data.uid.to_le_bytes()
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
        associated_token::mint = token_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
    )]
    pub user_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = lbp,
        associated_token::token_program = token_program,
    )]
    pub lbp_token_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = user,
        mint::authority = lbp,
        mint::decimals = 0,
    )]
    pub position_mint: InterfaceAccount<'info, Mint>,

    #[account(
        constraint = lbp.static_data.user_token_mint == token_mint.key() @ ErrorCode::IncorrectMint
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

// TODO: check that I did not forget a check or a step
pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let lbp_data: &mut Account<Lbp> = &mut ctx.accounts.lbp;

    if ctx.accounts.lbp_token_ata.amount + amount > lbp_data.static_data.user_max_cap {
        return err!(ErrorCode::MaxCapReached)
    }

    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.user_token_ata.to_account_info(),
                to: ctx.accounts.lbp_token_ata.to_account_info(),
                mint: ctx.accounts.token_mint.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.token_mint.decimals,
    )?;

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.position_mint.to_account_info(),
                to: ctx.accounts.user_position_ata.to_account_info(),
                authority: lbp_data.to_account_info()
            },
            &[&[b"lbp", & lbp_data.static_data.uid.to_le_bytes(), &[ctx.bumps.lbp]]],
        ),
        1,
    )?;

    let position_data: &mut Account<Position> = &mut ctx.accounts.position;
    position_data.initialize(ctx.accounts.position_mint.key(), amount, ctx.bumps.position);

    Ok(())
}
