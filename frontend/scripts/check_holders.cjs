const fs = require('fs')

async function main() {
    const file = fs.readFileSync('file.json')
    const json = JSON.parse(file)

    const uniqueOwners = new Set()
    const duplicates = []

    for (const account of json) {
        const owner = account.owner
        if (uniqueOwners.has(owner)) {
            duplicates.push(owner)
        }
        uniqueOwners.add(owner)
    }

    console.log(`json.length=${json.length}, uniqueOwners.size=${uniqueOwners.size}`)
    console.log({ duplicates: duplicates.sort() })
}

main()