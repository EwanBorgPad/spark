import * as fs from "fs"

async function main() {
  const file = fs.readFileSync('users.json').toString()
  const users = JSON.parse(file)

  const usersLen = users.length
  let oldestUser = users[0]
  for (const user of users) {
    const createdAt = new Date(user.createdAt)
    if (createdAt < new Date(oldestUser?.createdAt)) {
      oldestUser = user
    }
  }
  console.log({ usersLen })
  console.log({ oldestUser })
}

main().catch(console.error)
