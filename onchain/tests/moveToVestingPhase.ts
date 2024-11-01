import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as anchor from "@coral-xyz/anchor";
import {createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";

describe("Move to vesting phase", () => {
    let ctx: Context
    let poolStateAddress: PublicKey
    let lpMintAddress: PublicKey
    let creatorLpTokenAddress: PublicKey
    let launchedTokenVaultAddress: PublicKey
    let raisedTokenVaultAddress: PublicKey
    let observationStateAddress: PublicKey

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()

        let lbp = await ctx.program.account.lbp.fetchNullable(ctx.fundCollectionToVestingPhaseLbp);

        poolStateAddress = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("pool"),
                ctx.raydiumCpmmAmmConfig.toBuffer(),
                lbp.launchedTokenMint.toBuffer(),
                lbp.raisedTokenMint.toBuffer()
            ],
            ctx.raydiumCpmmProgramId
        )[0]

        lpMintAddress = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("pool_lp_mint"),
                poolStateAddress.toBuffer(),
            ],
            ctx.raydiumCpmmProgramId
        )[0]

        creatorLpTokenAddress = getAssociatedTokenAddressSync(
            lpMintAddress,
            ctx.fundCollectionToVestingPhaseLbp,
            true,
        )

        launchedTokenVaultAddress = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("pool_vault"),
                poolStateAddress.toBuffer(),
                lbp.launchedTokenMint.toBuffer(),
            ],
            ctx.raydiumCpmmProgramId
        )[0]

        raisedTokenVaultAddress = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("pool_vault"),
                poolStateAddress.toBuffer(),
                lbp.raisedTokenMint.toBuffer(),
            ],
            ctx.raydiumCpmmProgramId
        )[0]

        observationStateAddress = PublicKey.findProgramAddressSync(
            [
                anchor.utils.bytes.utf8.encode("observation"),
                poolStateAddress.toBuffer(),
            ],
            ctx.raydiumCpmmProgramId
        )[0]
    })

    it("It can move from fund collection to vesting phase", async () => {
        let lbp = await ctx.program.account.lbp.fetchNullable(ctx.fundCollectionToVestingPhaseLbp);

        assert.deepEqual(lbp.phase, {fundCollection: {}})

        const sig = await ctx.connection.requestAirdrop(
            ctx.fundCollectionToVestingPhaseLbp,
            42 * LAMPORTS_PER_SOL
        );

        const latestBlockHash = await ctx.connection.getLatestBlockhash();

        await ctx.connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: sig,
        });

        await ctx.program.methods
            .moveToVestingPhase()
            .accountsPartial({
                adminAuthority: ctx.adminAuthority.publicKey,
                lbp: ctx.fundCollectionToVestingPhaseLbp,
                // @ts-ignore
                raisedTokenMint: lbp.raisedTokenMint,
                launchedTokenMint: lbp.launchedTokenMint,
                dexProgramId: ctx.raydiumCpmmProgramId,
                ammConfig: ctx.raydiumCpmmAmmConfig,
                authority: ctx.raydiumCpmmAuthority,
                poolState: poolStateAddress,
                // TODO: check this is indeed a pda mint
                lpMint: lpMintAddress,
                creatorLpToken: creatorLpTokenAddress,
                launchedTokenVault: launchedTokenVaultAddress,
                raisedTokenVault: raisedTokenVaultAddress,
                createPoolFee: ctx.raydiumCpmmAmmCreatePoolFeeReceiver,
                observationState: observationStateAddress,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.adminAuthority])
            .rpc()
            // TODO remove
            .catch(console.log)

        // lbp = await ctx.program.account.lbp.fetchNullable(ctx.fundCollectionToVestingPhaseLbp);
        //
        // assert.deepEqual(lbp.phase, {vesting: {}})
    });
});
