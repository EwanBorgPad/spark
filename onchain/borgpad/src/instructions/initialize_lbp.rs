use anchor_lang::prelude::*;
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

    #[account(
        mut,
        constraint = config.admin_authority == admin.key() @ ErrorCode::NotAdmin
    )]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeLbp>, lbp_static_data: LbpStaticData) -> Result<()> {
    let lbp = Lbp { static_data: lbp_static_data, dynamic_data: LbpDynamicData::default() };
    ctx.accounts.lbp.set_inner(lbp);

    Ok(())
}
