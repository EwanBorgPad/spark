use anchor_lang::prelude::*;
use crate::instructions::initialize::*;
use crate::instructions::initialize_lbp::*;
use crate::state::lbp::LbpStaticData;
use solana_security_txt::security_txt;

pub mod instructions;
pub mod errors;
pub mod events;
pub mod state;

declare_id!("bpadkZmPMYyDPPLwedrKQcKoGAQhQqSkrACTWvB3U4t");

#[program]
pub mod borgpad {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        admin_authority: Pubkey,
        whitelist_authority: Pubkey
    ) -> Result<()> {
        return instructions::initialize::handler(ctx, admin_authority, whitelist_authority);
    }

    pub fn initialize_lbp(
        ctx: Context<InitializeLbp>,
        lbp_static_data: LbpStaticData
    ) -> Result<()> {
        return instructions::initialize_lbp::handler(ctx, lbp_static_data);
    }
}