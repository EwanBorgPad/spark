use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The mint does not correspond to the one in the lbp")]
    IncorrectMint,
    #[msg("This phase change is unauthorised")]
    InvalidPhaseChange,
    #[msg("The max cap has been reached")]
    MaxCapReached,
    #[msg("Signer must be the admin")]
    NotAdmin,
    #[msg("The fund collection phase is over")]
    FundCollectionPhaseCompleted,
    #[msg("The fund collection phase has not yet started")]
    FundCollectionPhaseNotStarted,
    #[msg("Cannot set the same admin")]
    SameAdmin,
}
