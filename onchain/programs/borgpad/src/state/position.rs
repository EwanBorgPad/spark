use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Position {
    /// The mint of the nft representing the position - used as uuid
    pub mint: Pubkey,
    /// The amount deposited by the user
    pub amount: u64,
    /// The bump of the pda
    pub bump: u8,
}

impl Position {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    pub fn initialize(
        &mut self,
        mint: Pubkey,
        amount: u64,
        bump: u8
    ) {
        self.mint = mint;
        self.amount = amount;
        self.bump = bump;
    }
}

