use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("The mint does not correspond to the one in the lbp")]
    IncorrectMint,
    #[msg("Signer must be the admin")]
    NotAdmin,
    #[msg("Cannot set the same admin")]
    SameAdmin,
}