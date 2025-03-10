const crypto = require("crypto");


function generateApiKey(keyName) {
  const keySecret = crypto.randomBytes(16).toString("hex")
  const keyId = 'sk_' + keyName
  const key = `${keyId}_${keySecret}`
  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const result = { keyId, key, keyHash }
  return result
}

function generateApiKeys(keyNames) {
  if (!Array.isArray(keyNames)) throw new Error('keyNames must be an array of strings!')
  const keys = keyNames.map(generateApiKey)
  // console.log(JSON.stringify(keys, null, 2))

  // insert query generation
  const insertQueries = keys.map(key => 
    `INSERT INTO api_key (id, created_at, permissions, hash) VALUES ('${key.keyId}', CURRENT_TIMESTAMP, '[\\"write\\"]', '${key.keyHash}');`
  )
  const insertQueriesStr = insertQueries.join('\n')
  console.log(insertQueriesStr)
}


generateApiKeys([

])
