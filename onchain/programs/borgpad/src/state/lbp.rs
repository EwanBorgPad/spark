use anchor_lang::prelude::*;

/// Valid phase change:
/// FundCollection -> Refund
/// FundCollection -> Vesting
#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Debug, Eq, PartialEq)]
pub enum Phase {
    FundCollection,
    Refund,
    Vesting,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone, Debug, Eq, PartialEq)]
pub struct LbpInitializeData {
    /// An id to uniquely identify the lbp
    pub uid: u64,

    /// The owner of the lbp
    pub project: Pubkey,

    /// The mint of the token supplied by the project
    pub launched_token_mint: Pubkey,
    /// The part of token that is used for the liquidity pool. The rest is sent to the reward pool
    pub launched_token_lp_distribution: u8,
    /// The max amount of token that the project can deposit
    pub launched_token_cap: u64,

    /// The mint of the token supplied by the users
    pub raised_token_mint: Pubkey,
    /// The min amount of token that the users must deposit to move to the LP locked phase
    /// If this amount is not reached the users are reimbursed
    pub raised_token_min_cap: u64,
    /// The max amount of token that the users can deposit
    pub raised_token_max_cap: u64,
    
    /// The duration of the cliff phase
    /// Expressed as Unix time (i.e. seconds since the Unix epoch).
    pub cliff_duration: u64,
    /// The duration of the vesting phase
    /// Expressed as Unix time (i.e. seconds since the Unix epoch).
    pub vesting_duration: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Lbp {
    /// An id to uniquely identify the lbp
    pub uid: u64,

    /// The owner of the lbp, i.e., the project launching the token
    pub project: Pubkey,

    /// The mint of the token supplied by the project
    pub launched_token_mint: Pubkey,
    /// The ata that holds the token deposited by the project
    pub launched_token_ata: Pubkey,
    /// The part of token that is used for the liquidity pool. The rest is sent to the reward pool
    pub launched_token_lp_distribution: u8,
    /// The max amount of token that the project must deposit
    pub launched_token_cap: u64,

    /// The mint of the token supplied by the users
    pub raised_token_mint: Pubkey,
    /// The ata that holds the token deposited by the users
    pub raised_token_ata: Pubkey,
    /// The min amount of token that the users must deposit to move to the LP locked phase
    /// If this amount is not reached the users are reimbursed
    pub raised_token_min_cap: u64,
    /// The max amount of token that the users can deposit
    pub raised_token_max_cap: u64,
    /// The amount of token that the users have deposited
    /// This amount is greater than raised_token_min_cap and smaller than raised_token_max_cap
    pub raised_token_cap: u64,

    /// The current phase of the lbp
    pub phase: Phase,
    /// The start time of the cliff phase
    /// Set by the program once the admin transition from fund collection to cliff phase
    /// Expressed as Unix time (i.e. seconds since the Unix epoch).
    pub vesting_start_time: u64,
    /// The duration of the cliff phase
    /// Expressed as Unix time (i.e. seconds since the Unix epoch).
    pub cliff_duration: u64,
    /// The duration of the vesting phase
    /// Expressed as Unix time (i.e. seconds since the Unix epoch).
    pub vesting_duration: u64,

    /// The bump of the pda
    pub bump: u8,
}

impl Lbp {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    pub fn initialize(
        &mut self,
        lbp_initialize: LbpInitializeData,
        launched_token_ata: Pubkey,
        raised_token_ata: Pubkey,
        bump: u8,
    ) {
        self.uid = lbp_initialize.uid;

        self.project = lbp_initialize.project;

        self.launched_token_mint = lbp_initialize.launched_token_mint;
        self.launched_token_ata = launched_token_ata;
        self.launched_token_lp_distribution = lbp_initialize.launched_token_lp_distribution;
        self.launched_token_cap = lbp_initialize.launched_token_cap;

        self.raised_token_mint = lbp_initialize.raised_token_mint;
        self.raised_token_ata = raised_token_ata;
        self.raised_token_min_cap = lbp_initialize.raised_token_min_cap;
        self.raised_token_max_cap = lbp_initialize.raised_token_max_cap;
        self.raised_token_cap = 0;

        self.phase = Phase::FundCollection;
        self.vesting_start_time = u64::MAX;
        self.cliff_duration = lbp_initialize.cliff_duration;
        self.vesting_duration = lbp_initialize.vesting_duration;

        self.bump = bump;
    }
}
