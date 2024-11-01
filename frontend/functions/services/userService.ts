import { UserModel } from "../../shared/models"

type FindUserByAddressArgs = {
  db: D1Database
  address: string
}
const findUserByAddress = async ({ db, address }: FindUserByAddressArgs): Promise<UserModel | null> => {
  const user = await db
    .prepare("SELECT * FROM user WHERE address = ?1")
    .bind(address)
    .first<UserModel | null>()

  if (!user) return null

  return {
    wallet_address: user?.wallet_address,
    json: JSON.parse(user.json as string),
  }
}
const findUserByAddressOrFail = async (args: FindUserByAddressArgs): Promise<UserModel> => {
  const user = await findUserByAddress(args)
  if (!user) throw new Error(`User (address=${args.address}) not found!`)
  return user
}

export const UserService = {
  findUserByAddress,
  findUserByAddressOrFail,
}
