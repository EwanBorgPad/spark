const crypto = require("crypto");


function generateApiKey(keyName) {
    const keySecret = crypto.randomBytes(16).toString("hex")
    const keyId = 'sk_' + keyName
    const key = `${keyId}_${keySecret}`
    const keyHash = crypto.createHash('sha256').update(key).digest('hex')
    const result = { keyId, key, keyHash }
    console.log(JSON.stringify(result, null, 2))
}


generateApiKey('milan')

// TODO remove env variable which holds the api key
// TODO remove env variable for integrations
// TODO add permissions (read, write)
