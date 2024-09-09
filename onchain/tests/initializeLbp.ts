import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as anchor from "@coral-xyz/anchor";
import {createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {PublicKey} from "@solana/web3.js";


describe("Initialize LBP", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("The test LBO exists", async () => {
        const lbp = await ctx.program.account.lbp.fetchNullable(ctx.fundCollectionPhaseLbp);
        assert.notEqual(lbp, null)
    })

    it("The admin authority can initialize a new LBP", async () => {
        const launchedTokenMint = await createMint(
            ctx.connection,
            ctx.project,
            ctx.project.publicKey,
            ctx.project.publicKey,
            9
        )

        const raisedTokenMint = await createMint(
            ctx.connection,
            ctx.user,
            ctx.user.publicKey,
            ctx.user.publicKey,
            9
        )

        const lbpInitalizeData = {
            uid: new BN(420),

            project: ctx.project.publicKey,

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
            // TOOD: check the seed is correct - print the created account in the program
            [Buffer.from("lbp"), lbpInitalizeData.uid.toArrayLike(Buffer, "le", 8)],
            ctx.program.programId
        );

        const raisedTokenAta = getAssociatedTokenAddressSync(
            lbpInitalizeData.raisedTokenMint,
            lbpPda[0],
            true
        )

        const launchedTokenAta = getAssociatedTokenAddressSync(
            lbpInitalizeData.launchedTokenMint,
            lbpPda[0],
            true
        )

        await ctx.program.methods
            .initializeLbp(lbpInitalizeData)
            .accountsPartial({
                adminAuthority: ctx.adminAuthority.publicKey,
                lbp: lbpPda[0],
                // @ts-ignore
                raisedTokenMint: lbpInitalizeData.raisedTokenMint,
                launchedTokenMint: lbpInitalizeData.launchedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.adminAuthority])
            .rpc()

        const lbp = await ctx.program.account.lbp.fetch(lbpPda[0]);

        assert.deepEqual(lbp.uid.toNumber(), lbpInitalizeData.uid.toNumber());
        assert.deepEqual(lbp.project, lbpInitalizeData.project);
        assert.deepEqual(lbp.launchedTokenMint, lbpInitalizeData.launchedTokenMint);
        assert.deepEqual(lbp.launchedTokenAta, launchedTokenAta);
        assert.deepEqual(lbp.launchedTokenLpDistribution, lbpInitalizeData.launchedTokenLpDistribution);
        assert.deepEqual(lbp.launchedTokenCap.toNumber(), lbpInitalizeData.launchedTokenCap.toNumber());
        assert.deepEqual(lbp.raisedTokenMint, lbpInitalizeData.raisedTokenMint);
        assert.deepEqual(lbp.raisedTokenAta, raisedTokenAta);
        assert.deepEqual(lbp.raisedTokenMinCap.toNumber(), lbpInitalizeData.raisedTokenMinCap.toNumber());
        assert.deepEqual(lbp.raisedTokenMaxCap.toNumber(), lbpInitalizeData.raisedTokenMaxCap.toNumber());
        assert.deepEqual(lbp.raisedTokenCap.toNumber(), 0);
        assert.deepEqual(lbp.phase, {fundCollection: {}});
        assert.deepEqual(lbp.vestingStartTime.toString(), "18446744073709551615");
        assert.deepEqual(lbp.cliffDuration.toNumber(), lbpInitalizeData.cliffDuration.toNumber());
        assert.deepEqual(lbp.vestingDuration.toNumber(), lbpInitalizeData.vestingDuration.toNumber());
        assert.deepEqual(lbp.bump, lbpPda[1]);
    });
});
