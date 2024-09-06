import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


describe("User Deposit", () => {
    let ctx: Context
    let amount = new BN(420_000)

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("The user can deposit", async () => {
        const raisedTokenUserBalBefore = await getAccount(
            ctx.connection,
            ctx.raisedTokenUserAta
        )

        const raisedTokenLbpBalBefore = await getAccount(
            ctx.connection,
            ctx.raisedTokenLbpAta
        )

        assert.equal(await ctx.program.account.position.fetchNullable(ctx.userPosition), null)

        await ctx.program.methods
            .userDeposit(amount)
            .accountsPartial({
                whitelistAuthority: ctx.whitelistAuthority.publicKey,
                user: ctx.user.publicKey,
                config: ctx.config,
                lbp: ctx.lbp,
                positionMint: ctx.userPositionMint.publicKey,
                position: ctx.userPosition,
                userPositionAta: ctx.userPositionAta,
                // @ts-ignore
                raisedTokenMint: ctx.raisedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.whitelistAuthority, ctx.user, ctx.userPositionMint])
            .rpc()

        const raisedTokenUserBalAfter = await getAccount(
            ctx.connection,
            ctx.raisedTokenUserAta
        )

        const raisedTokenLbpBalAfter = await getAccount(
            ctx.connection,
            ctx.raisedTokenLbpAta
        )

        assert.equal(raisedTokenLbpBalBefore.amount, 0)
        assert.equal(raisedTokenLbpBalAfter.amount, amount)
        assert.equal(raisedTokenUserBalBefore.amount - raisedTokenUserBalAfter.amount, amount)

        const userPosition = await ctx.program.account.position.fetchNullable(ctx.userPosition)
        const bump = PublicKey.findProgramAddressSync(
            [Buffer.from("position"), ctx.userPositionMint.publicKey.toBuffer()],
            ctx.program.programId
        )[1];

        assert.deepEqual(userPosition.mint, ctx.userPositionMint.publicKey)
        assert.deepEqual(userPosition.lbp, ctx.lbp)
        assert.equal(userPosition.amount.toNumber(), amount.toNumber())
        assert.equal(userPosition.bump, bump)

        const userPositionMint = await getMint(
            ctx.connection,
            ctx.userPositionMint.publicKey
        )

        assert.equal(userPositionMint.mintAuthority, null)
    });
});
