import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


describe("User refund", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("It can be refunded", async () => {
        const lbp = await ctx.program.account.lbp.fetchNullable(ctx.refundPhaseLbp);
        const position = await ctx.program.account.position.fetchNullable(ctx.refundPhaseUserPosition)

        assert.deepEqual(lbp.phase, {refund: {}})

        const raisedTokenUserAtaAddress = getAssociatedTokenAddressSync(
            lbp.raisedTokenMint,
            ctx.user.publicKey
        )

        const userPositionAtaAddress = getAssociatedTokenAddressSync(
            position.mint,
            ctx.user.publicKey,
        )

        const raisedTokenUserBalBefore = await getAccount(
            ctx.connection,
            raisedTokenUserAtaAddress
        )

        const raisedTokenLbpBalBefore = await getAccount(
            ctx.connection,
            lbp.raisedTokenAta
        )

        await ctx.program.methods
            .userRefund()
            .accountsPartial({
                user: ctx.user.publicKey,
                config: ctx.config,
                lbp: ctx.refundPhaseLbp,
                positionMint: position.mint,
                position: ctx.refundPhaseUserPosition,
                userPositionAta: userPositionAtaAddress,
                raisedTokenMint: lbp.raisedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.user])
            .rpc()

        const raisedTokenUserBalAfter = await getAccount(
            ctx.connection,
            raisedTokenUserAtaAddress
        )

        const raisedTokenLbpBalAfter = await getAccount(
            ctx.connection,
            lbp.raisedTokenAta
        )

        assert.equal(raisedTokenLbpBalBefore.amount,  ctx.amount)
        assert.equal(raisedTokenLbpBalAfter.amount, 0)
        assert.equal(raisedTokenUserBalAfter.amount - raisedTokenUserBalBefore.amount, ctx.amount)

        const userPosition = await ctx.program.account.position.fetchNullable(ctx.refundPhaseUserPosition)

        assert.equal(userPosition, null)

        try {
            await getAccount(ctx.connection, userPositionAtaAddress)
        } catch (e) {
            assert.equal(e.toString().includes("TokenAccountNotFoundError"), true)
        }
    });
});
