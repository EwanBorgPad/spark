import { Context } from "./helpers/context"
import * as assert from "assert";
import {BN} from "@coral-xyz/anchor";
import {TOKEN_PROGRAM_ID} from "@coral-xyz/anchor/dist/cjs/utils/token";
import {getAssociatedTokenAddressSync, getAccount, getMint} from "@solana/spl-token";
import {Keypair, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

describe("Set whitelist authority", () => {
    let ctx: Context
    let newWhitelistAuthority: Keypair

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()

        newWhitelistAuthority = Keypair.generate()
    })

    it("It can set the whitelist authority", async () => {
        let config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.whitelistAuthority, ctx.whitelistAuthority.publicKey)

        await ctx.program.methods
            .setWhitelistAuthority(newWhitelistAuthority.publicKey)
            .accountsPartial({
                config: ctx.config,
                adminAuthority: ctx.adminAuthority.publicKey
            })
            .signers([ctx.adminAuthority])
            .rpc()

        config = await ctx.program.account.config.fetchNullable(ctx.config);

        assert.deepEqual(config.whitelistAuthority, newWhitelistAuthority.publicKey)
    });
});
