# Borgpad programs

Go into `programs/borgpad/`

Build: `cargo build-sbf`

Test: `cargo test`

Build idl: `anchor idl build`

Verify that the program id matches the keypair in `target/deploy/borgpad-keypair.json`: `solana-keygen verify [PROGRAM_ID] ../../target/deploy/borgpad-keypair.json`