use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Signer must be the admin")]
    NotAdmin,
    #[msg("Cannot set the same admin")]
    SameAdmin,
}