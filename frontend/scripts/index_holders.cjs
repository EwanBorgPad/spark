const fs = require('fs')

const SOLANA_RPC_URL = ''

async function main() {
  const tokenAccounts = []
  let page = 1

  while (true) {
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccounts",
      params: {
        page,
        limit: 1000,
        mint: "3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z"
      }
    }

    console.log(`Fetching token accounts - solana RPC request: page=${page}`)

    const response = await fetch(SOLANA_RPC_URL, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    const responseJson = await response.json()

    if (responseJson.result.token_accounts.length === 0) {
      break
    }

    tokenAccounts.push(...responseJson.result.token_accounts)
    page += 1
  }

  fs.writeFileSync('file.json', JSON.stringify(tokenAccounts, null, 2))
}

main()