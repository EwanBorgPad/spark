use anchor_lang::prelude::*;
use anchor_spl::token_interface::TokenAccount;
use crate::errors::ErrorCode;
use crate::state::config::*;
use crate::state::lbp::*;

#[derive(Accounts)]
#[instruction(uid: u64)]
pub struct InitializeLbp<'info> {
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
            &uid.to_le_bytes()
        ],
        bump,
        payer = admin
    )]
    pub lbp: Account<'info, Lbp>,

    // TODO: create tokens ata
    // #[account(
    //     init_if_needed,
    //     payer = treasurer,
    //     associated_token::mint = token_mint,
    //     associated_token::authority = proxy,
    //     associated_token::token_program = token_program,
    // )]
    // pub lbp_ata: InterfaceAccount<'info, TokenAccount>,


    #[account(
        mut,
        constraint = config.admin_authority == admin_authority.key() @ ErrorCode::NotAdmin
    )]
    pub admin_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeLbp>, lbp_static_data: LbpStaticData) -> Result<()> {
    let lbp = Lbp { static_data: lbp_static_data, dynamic_data: LbpDynamicData::default() };
    ctx.accounts.lbp.set_inner(lbp);

    Ok(())
}
