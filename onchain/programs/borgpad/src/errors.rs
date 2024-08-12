use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The user must hold a position to perform this operation")]
    DoesNotHoldPosition,
    #[msg("The amount does not match with the one in the position or the lbp")]
    InvalidAmount,
    #[msg("The mint does not correspond to the one in the lbp")]
    InvalidMint,
    #[msg("This phase change is unauthorised")]
    InvalidPhaseChange,
    #[msg("The max cap has been reached")]
    MaxCapReached,
    #[msg("Signer must be the admin authority")]
    NotAdminAuthority,
    #[msg("Signer must be the project")]
    NotProject,
    #[msg("Signer must be the whitelist authority")]
    NotWhitelistAuthority,
    #[msg("The fund collection phase is over")]
    FundCollectionPhaseCompleted,
    #[msg("The fund collection phase has not yet started")]
    FundCollectionPhaseNotStarted,
    #[msg("Cannot set the same admin")]
    SameAdminAuthority,
    #[msg("This operation is not authorised in the current phase")]
    UnauthorisedOperationInCurrentPhase
}
