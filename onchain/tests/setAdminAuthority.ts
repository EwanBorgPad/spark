import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

describe("Set admin authority", () => {
    let ctx: Context
    let newAdminAuthority: Keypair

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()

        newAdminAuthority = Keypair.generate()
    })

    after('Set old authority back', async function () {
        await ctx.program.methods
            .nominateNewAdminAuthority(ctx.adminAuthority.publicKey)
            .accountsPartial({
                config: ctx.config,
                adminAuthority: newAdminAuthority.publicKey
            })
            .signers([newAdminAuthority])
            .rpc()

        await ctx.program.methods
            .acceptAdminAuthority()
            .accountsPartial({
                config: ctx.config,
                newAdminAuthority: ctx.adminAuthority.publicKey
            })
            .signers([ctx.adminAuthority])
            .rpc()

        let config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.adminAuthority, ctx.adminAuthority.publicKey)
        assert.deepEqual(config.pendingAdminAuthority, null)
    })

    it("It can nominate a new admin authority", async () => {
        let config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.adminAuthority, ctx.adminAuthority.publicKey)
        assert.deepEqual(config.pendingAdminAuthority, null)

        await ctx.program.methods
            .nominateNewAdminAuthority(newAdminAuthority.publicKey)
            .accountsPartial({
                config: ctx.config,
                adminAuthority: ctx.adminAuthority.publicKey
            })
            .signers([ctx.adminAuthority])
            .rpc()

        config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.adminAuthority, ctx.adminAuthority.publicKey)
        assert.deepEqual(config.pendingAdminAuthority, newAdminAuthority.publicKey)
    });

    it("It can accept the admin authority", async () => {
        let config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.adminAuthority, ctx.adminAuthority.publicKey)
        assert.deepEqual(config.pendingAdminAuthority, newAdminAuthority.publicKey)

        await ctx.program.methods
            .acceptAdminAuthority()
            .accountsPartial({
                config: ctx.config,
                newAdminAuthority: newAdminAuthority.publicKey
            })
            .signers([newAdminAuthority])
            .rpc()

        config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.adminAuthority, newAdminAuthority.publicKey)
        assert.deepEqual(config.pendingAdminAuthority, null)
    });
});
