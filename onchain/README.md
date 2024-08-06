# Borgpad programs

## Info

Devnet deployer: `J23LkU7bYkZJxiRzsBhUftoP5T1bDtqbfYkT1kNJf77x`

Devnet program id: `bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4`

Devnet config: `4sNCxBsELhB6amzrhURgEfYSCY9JwEygr28dGGfpFYUT`

Devnet example lbp: `BpWYQLwzJDJYB9awK5JYDrH7v6HcwkYuBeWeSpL17KDh`

## Dev environment

Build: 
- Run: `cargo build-sbf`

Test: 
- Run: `cargo test`

Build idl: 
- Go into: `programs/borgpad/`
- Run: `anchor idl build -o ../../borgpad-idl.json`

Verify that the program id matches the keypair in `target/deploy/borgpad-keypair.json`: `solana-keygen verify <PROGRAM_ID> ../../target/deploy/borgpad-keypair.json`

Deploy:
- Run: `solana program deploy --url devnet --keypair borgpad-devnet-deployer.json --program-id target/deploy/borgpad-keypair.json target/deploy/borgpad.so`

Upgrade:
- Run: `solana program write-buffer --url devnet --keypair borgpad-devnet-deployer.json target/deploy/borgpad.so`
- Copy buffer address outputted by the previous command
- Run: `solana program upgrade --url devnet --keypair borgpad-devnet-deployer.json <BUFFER_ADDRESS> bpadbLrS3Mw2e1EDSEnYzYpNwAQgJQXXHkT57D4TTJ4`
