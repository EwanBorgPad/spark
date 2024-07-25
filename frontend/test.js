import { Rettiwt } from "rettiwt-api"
import * as fs from "fs"

// TODO investigate risks of using this lib + risks of using unofficial APIs

/**
 * my api key
 * @type {string}
 */
const apiKey = ''
/**
 * Use this to find twitterId: https://ilo.so/twitter-id
 * @type {string}
 */
const twitterId = '1791134718131408897' // @borgpadhq // https://x.com/borgpadhq

async function main() {
  const rettiwt = new Rettiwt({
    apiKey,
    // logging: true,
  })

  const users = []

  let cursor = undefined
  do {
    console.log('Calling api with cursor: ', cursor)
    const res = await rettiwt.user.followers(twitterId, 100, cursor)
    const resList = res.list
    users.push(...res.list)

    await sleep(10)
    cursor = res.next.value
    fs.writeFileSync('users3.json', JSON.stringify(users, null, 2))

    if (!resList.length) {
      console.log('res list is empty!!!')
      break
    }
  } while (cursor)

  fs.writeFileSync('users3.json', JSON.stringify(users, null, 2))
}

main().catch(console.error)

const sleep = ms => new Promise(r => setTimeout(r, ms));


// % node test.js // called on 24-July-2024
// Calling api with cursor:  undefined
// Calling api with cursor:  1804385201618990038|1816105150826151884
// Calling api with cursor:  1802937856818101400|1816105150826151832
// Calling api with cursor:  1800953507434171979|1816105150826151780
// Calling api with cursor:  1799858872355506150|1816105150826151728
// Calling api with cursor:  1799542254335847602|1816105150826151676
// Calling api with cursor:  1799364514370851368|1816105150826151624
// Calling api with cursor:  1799289644745377763|1816105150826151572
// Calling api with cursor:  1799243885462061073|1816105150826151521
// Calling api with cursor:  1799235925509775412|1816105150826151469
// Calling api with cursor:  1799229133888575865|1816105150826151417
// Calling api with cursor:  1799227096740660831|1816105150826151366
// Calling api with cursor:  1799226221500549659|1816105150826151314
// Calling api with cursor:  0|1816105150826151266
// Calling api with cursor:  0|1816105150826151264
// Calling api with cursor:  0|1816105150826151262
// Calling api with cursor:  0|1816105150826151260
// Calling api with cursor:  0|1816105150826151258
// Calling api with cursor:  0|1816105150826151256
// Calling api with cursor:  0|1816105150826151254
// Calling api with cursor:  0|1816105150826151252
// Calling api with cursor:  0|1816105150826151250
// Calling api with cursor:  0|1816105150826151248
// Calling api with cursor:  0|1816105150826151246
// Calling api with cursor:  0|1816105150826151244
// Calling api with cursor:  0|1816105150826151242
// Calling api with cursor:  0|1816105150826151240
// Calling api with cursor:  0|1816105150826151238
// Calling api with cursor:  0|1816105150826151236
// Calling api with cursor:  0|1816105150826151234
// Calling api with cursor:  0|1816105150826151232
// Calling api with cursor:  0|1816105150826151230
// Calling api with cursor:  0|1816105150826151228
// RettiwtError: TOO_MANY_REQUESTS


// % node test.js // called on 24-July-2024
// Calling api with cursor:  undefined
// Calling api with cursor:  1804385201618990038|1816108330418962380
// Calling api with cursor:  1802937856818101400|1816108330418962328
// Calling api with cursor:  1800953507434171979|1816108330418962276
// Calling api with cursor:  1799858872355506150|1816108330418962224
// Calling api with cursor:  1799542254335847602|1816108330418962172
// Calling api with cursor:  1799364514370851368|1816108330418962120
// Calling api with cursor:  1799289644745377763|1816108330418962068
// Calling api with cursor:  1799243885462061073|1816108330418962017
// Calling api with cursor:  1799235925509775412|1816108330418961965
// Calling api with cursor:  1799229133888575865|1816108330418961913
// Calling api with cursor:  1799227096740660831|1816108330418961862
// Calling api with cursor:  1799226221500549659|1816108330418961810
// Calling api with cursor:  0|1816108330418961762
// res list is empty!!!
