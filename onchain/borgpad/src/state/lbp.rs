use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Lbp {
    pub static_data: LbpStaticData,
    pub dynamic_data: LbpDynamicData
}

// TODO: use UnixTimestamp instead of u64 - require i64 to implement space trait

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Default, Clone)]
pub struct LbpDynamicData {
    /// The amount of token that remains after the end of the fund collection phase
    /// If the user_max_cap is reached, the project_cap equals the project_max_cap
    pub project_cap: u64,

    /// The amount of token that the users have deposited
    /// This amount is greater than user_min_cap and smaller than user_max_cap
    pub user_cap: u64,

    /// The start time of the LP locked phase
    /// Set by the program once the admin transition from fund collection to lp locked phase
    pub lp_locked_phase_start_time: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace, Clone)]
pub struct LbpStaticData {
    /// An id to uniquely identify the lbp
    pub uid: u64,

    /// The owner of the lbp
    pub project_owner: Pubkey,
    /// The mint of the token supplied by the project
    pub project_token_mint: Pubkey,
    /// The part of token that is used for the liquidity pool. The rest is sent to the reward pool
    pub project_token_lp_distribution: u8,
    /// The max amount of token that the project can deposit
    pub project_max_cap: u64,

    /// The mint of the token supplied by the users
    pub user_token_mint: Pubkey,
    /// The min amount of token that the users must deposit to move to the LP locked phase
    /// If this amount is not reached the users are reimbursed
    pub user_min_cap: u64,
    /// The max amount of token that the users can deposit
    pub user_max_cap: u64,

    /// The start time of the fund collection phase
    pub fund_collection_phase_start_time: u64,
    /// The end time of the fund collection phase
    pub fund_collection_phase_end_time: u64,

    /// The locking time of the LP locked phase
    pub lp_locked_phase_locking_time: u64,
    /// The vesting time of the LP locked phase
    pub lp_locked_phase_vesting_time: u64,

    /// The bump of the pda
    pub bump: u8,
}

impl Lbp {
    pub const LEN: usize = 8 + Self::INIT_SPACE;

    // TODO: remove if not needed
    // pub fn init(lbp_static_data: LbpStaticData, bump: u8) {
    //     Self.static_data.uid = lbp_static_data.uid;
    //
    //     Self.static_data.project_owner = lbp_static_data.project_owner;
    //     Self.static_data.project_token_mint = lbp_static_data.project_token_mint;
    //     Self.static_data.project_token_lp_distribution = lbp_static_data.project_token_lp_distribution;
    //     Self.static_data.project_max_cap = lbp_static_data.project_max_cap;
    //
    //     Self.static_data.user_token_mint = lbp_static_data.user_token_mint;
    //     Self.static_data.user_min_cap = lbp_static_data.user_min_cap;
    //     Self.static_data.user_min_cap = lbp_static_data.user_max_cap;
    //
    //     Self.static_data.fund_collection_phase_start_time = lbp_static_data.fund_collection_phase_start_time;
    //     Self.static_data.fund_collection_phase_end_time = lbp_static_data.fund_collection_phase_end_time;
    //
    //     Self.static_data.lp_locked_phase_locking_time = lbp_static_data.lp_locked_phase_locking_time;
    //     Self.static_data.lp_locked_phase_vesting_time = lbp_static_data.lp_locked_phase_vesting_time;
    //
    //     Self.static_data.bump = bump;
    // }
}

