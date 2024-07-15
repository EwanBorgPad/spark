use anchor_lang::prelude::*;
use solana_program::log::sol_log;

#[derive(Accounts)]
pub struct InitializeLBP<'info> {
    pub treasurer: Signer<'info>,
}

pub fn handler(_ctx: Context<InitializeLBP>) -> Result<()> {
    sol_log("Init LBP");    

    Ok(())
}
