use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Config {
    /// The authority that has admin right
    pub admin_authority: Pubkey,
    /// The pending new authority that has admin right
    pub pending_admin_authority: Option<Pubkey>,
    /// The authority that has whitelist right
    pub whitelist_authority: Pubkey,
    /// The bump of the pda
    pub bump: u8,
}

impl Config {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    pub fn initialize(&mut self, admin_authority: Pubkey, whitelist_authority: Pubkey, bump: u8) {
        self.admin_authority = admin_authority;
        self.pending_admin_authority = None;
        self.whitelist_authority = whitelist_authority;
        self.bump = bump;
    }
}
