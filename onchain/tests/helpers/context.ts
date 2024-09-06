import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, BN, Program, web3} from "@coral-xyz/anchor";
import {Borgpad} from "../../target/types/borgpad";
import {
    PublicKey,
    LAMPORTS_PER_SOL,
    Connection,
    Keypair,
} from "@solana/web3.js";
import dotenv from "dotenv";
import * as Fs from "node:fs";
import {sha256} from "js-sha256";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
dotenv.config();

export class Context {
    public provider: AnchorProvider;
    public connection: Connection;

    public deployer: Keypair;
    public adminAuthority: Keypair;
    public whitelistAuthority: Keypair;
    public project: Keypair;
    public user: Keypair;

    public program: anchor.Program<Borgpad>;
    public config: PublicKey;
    public lbpUid: number = 42;
    public lbp: PublicKey;

    async init() {
        this.provider = anchor.getProvider() as AnchorProvider;
        this.connection = anchor.getProvider().connection;

        await this.init_wallet_context();

        await this.init_program_context();

        await this.init_lbp_context();

        if (
            (await this.program.account.config.fetchNullable(this.config)) ==
            null
        ) {
            await this.airdrop();

            await this.init_config();

            await this.init_lbp();
        }
    }

    async init_wallet_context() {
        this.deployer = Keypair.fromSeed(new Uint8Array(
            JSON.parse(Fs.readFileSync("tests/helpers/local_deployer.json").toString())
        ).slice(0, 32));
        this.adminAuthority = anchor.web3.Keypair.fromSeed(
            Uint8Array.from(sha256.digest("adminAuthority"))
        );
        this.whitelistAuthority = anchor.web3.Keypair.fromSeed(
            Uint8Array.from(sha256.digest("whitelistAuthority"))
        );
        this.project = anchor.web3.Keypair.fromSeed(
            Uint8Array.from(sha256.digest("project"))
        );
        this.user = anchor.web3.Keypair.fromSeed(
            Uint8Array.from(sha256.digest("user"))
        );
    }

    async init_program_context() {
        this.program = anchor.workspace
            .Borgpad as Program<Borgpad>;
        [this.config] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            this.program.programId
        );
    }

    async init_lbp_context() {
        this.lbp = PublicKey.findProgramAddressSync(
            [Buffer.from("lbp"), (new BN(this.lbpUid)).toArrayLike(Buffer, "le", 8)],
            this.program.programId
        )[0];
    }

    async airdrop() {
        const sig0 = await this.connection.requestAirdrop(
            this.deployer.publicKey,
            42 * LAMPORTS_PER_SOL
        );
        const sig1 = await this.connection.requestAirdrop(
            this.adminAuthority.publicKey,
            42 * LAMPORTS_PER_SOL
        );
        const sig2 = await this.connection.requestAirdrop(
            this.whitelistAuthority.publicKey,
            42 * LAMPORTS_PER_SOL
        );
        const sig3 = await this.connection.requestAirdrop(
            this.project.publicKey,
            42 * LAMPORTS_PER_SOL
        );
        const sig4 = await this.connection.requestAirdrop(
            this.user.publicKey,
            42 * LAMPORTS_PER_SOL
        );

        const latestBlockHash = await this.connection.getLatestBlockhash();

        await this.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig0,
        });
        await this.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig1,
        });
        await this.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig2,
        });
        await this.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig3,
        });
        await this.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig4,
        });
    }

    async init_config() {
        const res = await this.connection.getParsedAccountInfo(this.program.programId)

        await this.program.methods
            .initialize(
                this.adminAuthority.publicKey,
                this.whitelistAuthority.publicKey,
            )
            .accounts({
                deployer: this.deployer.publicKey,
                // @ts-ignore
                programData: res.value.data.parsed.info.programData
            })
            .signers([this.deployer])
            .rpc();
    }

    async init_lbp() {
        const launchedTokenMint = await createMint(
            this.connection,
            this.project,
            this.project.publicKey,
            this.project.publicKey,
            9
        )

        const launchedTokenProjectAta = (await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.project,
            launchedTokenMint,
            this.project.publicKey
        )).address

        await mintTo(
            this.connection,
            this.project,
            launchedTokenMint,
            launchedTokenProjectAta,
            this.project.publicKey,
            42 * 10 ** 9
        )

        const raisedTokenMint = await createMint(
            this.connection,
            this.user,
            this.user.publicKey,
            this.user.publicKey,
            9
        )

        const raisedTokenUserAta = (await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.user,
            raisedTokenMint,
            this.user.publicKey
        )).address

        await mintTo(
            this.connection,
            this.user,
            raisedTokenMint,
            raisedTokenUserAta,
            this.user.publicKey,
            42 * 10 ** 9
        )

        const lbpInitalizeData = {
            uid: new BN(this.lbpUid),

            project: this.project.publicKey,

            launchedTokenMint: launchedTokenMint,
            launchedTokenLpDistribution: 40,
            launchedTokenCap: new BN(1_000_000),

            raisedTokenMint: raisedTokenMint,
            raisedTokenMinCap: new BN(500_000),
            raisedTokenMaxCap: new BN(1_000_000),

            cliffDuration: new BN(0),
            vestingDuration: new BN(0),
        }

        const lbpPda = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("lbp"), lbpInitalizeData.uid.toArrayLike(Buffer, "le", 8)],
            this.program.programId
        );

        await this.program.methods
            .initializeLbp(lbpInitalizeData)
            .accounts({
                adminAuthority: this.adminAuthority.publicKey,
                // @ts-ignore
                lbp: lbpPda[0],
                // @ts-ignore
                raisedTokenMint: raisedTokenMint,
                launchedTokenMint: launchedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([this.adminAuthority])
            .rpc()
    }
}
