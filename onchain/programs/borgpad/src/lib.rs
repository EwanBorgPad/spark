use crate::instructions::initialize::*;
use crate::instructions::initialize_lbp::*;
use crate::instructions::move_to_next_phase::*;
use crate::instructions::set_admin_authority::*;
use crate::instructions::set_whitelist_authority::*;
use crate::instructions::user_deposit::*;
use crate::state::lbp::{LbpInitializeData, Phase};
use anchor_lang::prelude::*;
use solana_security_txt::security_txt;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "BorgPad",
    project_url: "https://x.com/borgpadhq",
    contacts: "TBD",
    policy: "TBD"
}

declare_id!("bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4");

#[program]
pub mod borgpad {
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

    pub fn set_admin_authority(ctx: Context<SetAdminAuthority>) -> Result<()> {
        instructions::set_admin_authority::handler(ctx)
    }

    pub fn set_whitelist_authority(
        ctx: Context<SetWhitelistAuthority>,
        new_whitelist_authority: Pubkey,
    ) -> Result<()> {
        instructions::set_whitelist_authority::handler(ctx, new_whitelist_authority)
    }

    pub fn move_to_next_phase(
        ctx: Context<MoveToNextPhase>,
        phase: Phase
    ) -> Result<()> {
        instructions::move_to_next_phase::handler(ctx, phase)
    }

    pub fn user_deposit(
        ctx: Context<UserDeposit>,
        amount: u64
    ) -> Result<()> {
        instructions::user_deposit::handler(ctx, amount)
    }
}
