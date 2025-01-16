const findUserByAddress = async ({ db, address }) => {
    const user = await db
        .prepare("SELECT * FROM user WHERE address = ?1")
        .bind(address)
        .first();
    if (!user)
        return null;
    return {
        wallet_address: user?.wallet_address,
        json: JSON.parse(user.json),
    };
};
const findUserByAddressOrFail = async (args) => {
    const user = await findUserByAddress(args);
    if (!user)
        throw new Error(`User (address=${args.address}) not found!`);
    return user;
};
export const UserService = {
    findUserByAddress,
    findUserByAddressOrFail,
};
