use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Position {
    /// The mint of the nft representing the position - used as uuid
    pub mint: Pubkey,
    /// The lpb this position is linked to
    pub lbp: Pubkey,
    /// The amount deposited by the user
    pub amount: u64,
    /// The bump of the pda
    pub bump: u8,
    // TODO: define a field to track how much has already been claimed for the position - should be dynamic and function of self.amount and lbp.user_cap
}

impl Position {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    pub fn initialize(&mut self, mint: Pubkey, lbp: Pubkey, amount: u64, bump: u8) {
        self.mint = mint;
        self.lbp = lbp;
        self.amount = amount;
        self.bump = bump;
    }
}
