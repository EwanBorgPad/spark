use anchor_lang::prelude::*;
use crate::instructions::initialize_lbp::*;
use solana_security_txt::security_txt;

pub mod instructions;
pub mod errors;
pub mod events;

declare_id!("awerLVSjzcEWgRTK7WwbRZFnkhbUNHG5dwNMvY2a9JK");

#[program]
pub mod borgpad {
    use super::*; 

    pub fn initialize_lbp(ctx: Context<InitializeLBP>) -> Result<()> {
        return instructions::initialize_lbp::handler(ctx);
    }
}