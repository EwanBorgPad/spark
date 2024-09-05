import { Context } from "./helpers/context"
import * as assert from "assert";

describe("Initialize", () => {
    let ctx: Context

    before('Init context', async function () {
        ctx = new Context()
        await ctx.init()
    })

    it("Is initialized", async () => {
        const config = await ctx.program.account.config.fetch(ctx.config);
        assert.deepEqual(config.adminAuthority, ctx.adminAuthority.publicKey);
        assert.deepEqual(config.whitelistAuthority, ctx.whitelistAuthority.publicKey);
    });

    it("Cannot be reinitialized", async () => {
        const res = await ctx.connection.getParsedAccountInfo(ctx.program.programId)

        await assert.rejects(
            ctx.program.methods
                .initialize(ctx.adminAuthority.publicKey, ctx.whitelistAuthority.publicKey)
                .accounts({
                    deployer: ctx.deployer.publicKey,
                    // @ts-ignore
                    programData: res.value.data.parsed.info.programData
                })
                .signers([ctx.deployer])
                .rpc(),
            /0x0/) // already initialized
    });
});
