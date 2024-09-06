import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as anchor from "@coral-xyz/anchor";
import {createMint, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";


describe("Move to next phase", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("It can move from fund collection to refund phase", async () => {
        let lbp = await ctx.program.account.lbp.fetchNullable(ctx.phaseChangeLbp);

        assert.deepEqual(lbp.phase, {fundCollection: {}})

        await ctx.program.methods
            .moveToNextPhase({ "refund": {} })
            .accountsPartial({
                adminAuthority: ctx.adminAuthority.publicKey,
                lbp: ctx.phaseChangeLbp,
                // @ts-ignore
                raisedTokenMint: lbp.raisedTokenMint,
                launchedTokenMint: lbp.launchedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.adminAuthority])
            .rpc()

        lbp = await ctx.program.account.lbp.fetchNullable(ctx.phaseChangeLbp);

        assert.deepEqual(lbp.phase, {refund: {}})
    });
});
