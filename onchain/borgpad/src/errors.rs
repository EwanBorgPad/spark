use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Signer must be the admin")]
    NotAdmin,
}