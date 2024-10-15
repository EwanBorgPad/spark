use crate::instructions::accept_admin_authority::*;
use crate::instructions::initialize::*;
use crate::instructions::initialize_lbp::*;
use crate::instructions::move_to_refund_phase::*;
use crate::instructions::move_to_vesting_phase::*;
use crate::instructions::nominate_new_admin_authority::*;
use crate::instructions::set_whitelist_authority::*;
use crate::instructions::user_deposit::*;
use crate::instructions::user_refund::*;
use crate::instructions::project_deposit::*;
use crate::instructions::project_refund::*;
use crate::state::lbp::LbpInitializeData;
use anchor_lang::prelude::*;
use solana_security_txt::security_txt;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "BorgPad",
    project_url: "https://x.com/borgpadhq",
    contacts: "TBD",
    policy: "TBD"
}

declare_id!("3YWxBeMNJwxCEi2ru4UfxEhTPjzAZnwCXEsWFgdpQGi5");

#[program]
pub mod borgpad {
    use crate::instructions::user_refund::UserRefund;
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        admin_authority: Pubkey,
        whitelist_authority: Pubkey,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, admin_authority, whitelist_authority)
    }

    pub fn initialize_lbp(
        ctx: Context<InitializeLbp>,
        lbp_initialize: LbpInitializeData,
    ) -> Result<()> {
        instructions::initialize_lbp::handler(ctx, lbp_initialize)
    }

    pub fn nominate_new_admin_authority(ctx: Context<NominateNewAdminAuthority>, new_admin_authority: Pubkey) -> Result<()> {
        instructions::nominate_new_admin_authority::handler(ctx, new_admin_authority)
    }

    pub fn accept_admin_authority(ctx: Context<AcceptAdminAuthority>) -> Result<()> {
        instructions::accept_admin_authority::handler(ctx)
    }

    pub fn set_whitelist_authority(
        ctx: Context<SetWhitelistAuthority>,
        new_whitelist_authority: Pubkey,
    ) -> Result<()> {
        instructions::set_whitelist_authority::handler(ctx, new_whitelist_authority)
    }

    pub fn move_to_refund_phase(
        ctx: Context<MoveToRefundPhase>,
    ) -> Result<()> {
        instructions::move_to_refund_phase::handler(ctx)
    }

    pub fn move_to_vesting_phase(
        ctx: Context<MoveToVestingPhase>,
    ) -> Result<()> {
        instructions::move_to_vesting_phase::handler(ctx)
    }

    pub fn user_deposit(
        ctx: Context<UserDeposit>,
        amount: u64
    ) -> Result<()> {
        instructions::user_deposit::handler(ctx, amount)
    }

    pub fn user_refund(
        ctx: Context<UserRefund>,
    ) -> Result<()> {
        instructions::user_refund::handler(ctx)
    }

    pub fn project_deposit(
        ctx: Context<ProjectDeposit>,
        amount: u64
    ) -> Result<()> {
        instructions::project_deposit::handler(ctx, amount)
    }

    pub fn project_refund(
        ctx: Context<ProjectRefund>,
    ) -> Result<()> {
        instructions::project_refund::handler(ctx)
    }
}
