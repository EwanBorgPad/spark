import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


describe("Project refund", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("It can be refunded", async () => {
        const lbp = await ctx.program.account.lbp.fetchNullable(ctx.refundPhaseLbp);

        assert.deepEqual(lbp.phase, {refund: {}})

        const launchedTokenUserAtaAddress = getAssociatedTokenAddressSync(
            lbp.launchedTokenMint,
            ctx.project.publicKey
        )

        const launchedTokenUserBalBefore = await getAccount(
            ctx.connection,
            launchedTokenUserAtaAddress
        )

        const launchedTokenLbpBalBefore = await getAccount(
            ctx.connection,
            lbp.launchedTokenAta
        )

        await ctx.program.methods
            .projectRefund()
            .accountsPartial({
                project: ctx.project.publicKey,
                config: ctx.config,
                lbp: ctx.refundPhaseLbp,
                launchedTokenMint: lbp.launchedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.project])
            .rpc()

        const launchedTokenUserBalAfter = await getAccount(
            ctx.connection,
            launchedTokenUserAtaAddress
        )

        const launchedTokenLbpBalAfter = await getAccount(
            ctx.connection,
            lbp.launchedTokenAta
        )

        assert.equal(launchedTokenLbpBalBefore.amount,  lbp.launchedTokenCap)
        assert.equal(launchedTokenLbpBalAfter.amount, 0)
        assert.equal(launchedTokenUserBalAfter.amount - launchedTokenUserBalBefore.amount, lbp.launchedTokenCap)
    });
});
