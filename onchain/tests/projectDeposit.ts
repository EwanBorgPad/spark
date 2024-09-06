import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

describe("Project Deposit", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("It can deposit", async () => {
        const lbp = await ctx.program.account.lbp.fetchNullable(ctx.lbp);

        const launchedTokenProjectAta = getAssociatedTokenAddressSync(
            lbp.launchedTokenMint,
            ctx.project.publicKey
        )

        const launchedTokenProjectBalBefore = await getAccount(
            ctx.connection,
            launchedTokenProjectAta
        )

        const launchedTokenLbpBalBefore = await getAccount(
            ctx.connection,
            lbp.launchedTokenAta
        )

        await ctx.program.methods
            .projectDeposit(lbp.launchedTokenCap)
            .accountsPartial({
                project: ctx.project.publicKey,
                config: ctx.config,
                lbp: ctx.lbp,
                // @ts-ignore
                launchedTokenMint: lbp.launchedTokenMint,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([ctx.project])
            .rpc()

        const launchedTokenProjectBalAfter = await getAccount(
            ctx.connection,
            launchedTokenProjectAta
        )

        const launchedTokenLbpBalAfter = await getAccount(
            ctx.connection,
            lbp.launchedTokenAta
        )

        assert.equal(launchedTokenLbpBalBefore.amount, 0)
        assert.equal(launchedTokenLbpBalAfter.amount, lbp.launchedTokenCap)
        assert.equal(launchedTokenProjectBalBefore.amount - launchedTokenProjectBalAfter.amount, lbp.launchedTokenCap)
    });
});
