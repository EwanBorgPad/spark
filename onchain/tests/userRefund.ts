import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


describe("User refund", () => {
    let ctx: Context
    let amount = new BN(420_000)

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("It can be refunded", async () => {
        const lbp = await ctx.program.account.lbp.fetchNullable(ctx.refundFundPhaseLbp);

        assert.deepEqual(lbp.phase, {refund: {}})

        // const raisedTokenUserAta = getAssociatedTokenAddressSync(
        //     lbp.raisedTokenMint,
        //     ctx.user.publicKey
        // )
        //
        // const userPositionMintKp = Keypair.generate()
        //
        // const userPositionPk = PublicKey.findProgramAddressSync(
        //     [Buffer.from("position"), ctx.fundCollectionPhaseLbp.toBuffer(), userPositionMintKp.publicKey.toBuffer()],
        //     ctx.program.programId
        // );
        //
        // const userPositionAta = getAssociatedTokenAddressSync(
        //     userPositionMintKp.publicKey,
        //     ctx.user.publicKey,
        // )
        //
        // const raisedTokenUserBalBefore = await getAccount(
        //     ctx.connection,
        //     raisedTokenUserAta
        // )
        //
        // const raisedTokenLbpBalBefore = await getAccount(
        //     ctx.connection,
        //     lbp.raisedTokenAta
        // )
        //
        // assert.equal(await ctx.program.account.position.fetchNullable(userPositionPk[0]), null)
        //
        // await ctx.program.methods
        //     .userDeposit(amount)
        //     .accountsPartial({
        //         whitelistAuthority: ctx.whitelistAuthority.publicKey,
        //         user: ctx.user.publicKey,
        //         config: ctx.config,
        //         lbp: ctx.fundCollectionPhaseLbp,
        //         positionMint: userPositionMintKp.publicKey,
        //         position: userPositionPk[0],
        //         userPositionAta: userPositionAta,
        //         // @ts-ignore
        //         raisedTokenMint: lbp.raisedTokenMint,
        //         tokenProgram: TOKEN_PROGRAM_ID
        //     })
        //     .signers([ctx.whitelistAuthority, ctx.user, userPositionMintKp])
        //     .rpc()
        //
        // const raisedTokenUserBalAfter = await getAccount(
        //     ctx.connection,
        //     raisedTokenUserAta
        // )
        //
        // const raisedTokenLbpBalAfter = await getAccount(
        //     ctx.connection,
        //     lbp.raisedTokenAta
        // )
        //
        // assert.equal(raisedTokenLbpBalBefore.amount, 0)
        // assert.equal(raisedTokenLbpBalAfter.amount, amount)
        // assert.equal(raisedTokenUserBalBefore.amount - raisedTokenUserBalAfter.amount, amount)
        //
        // const userPosition = await ctx.program.account.position.fetchNullable(userPositionPk[0])
        //
        // assert.deepEqual(userPosition.mint, userPositionMintKp.publicKey)
        // assert.deepEqual(userPosition.lbp, ctx.fundCollectionPhaseLbp)
        // assert.equal(userPosition.amount.toNumber(), amount.toNumber())
        // assert.equal(userPosition.bump, userPositionPk[1])
        //
        // const userPositionMint = await getMint(
        //     ctx.connection,
        //     userPositionMintKp.publicKey
        // )
        //
        // assert.equal(userPositionMint.mintAuthority, null)
    });
});
