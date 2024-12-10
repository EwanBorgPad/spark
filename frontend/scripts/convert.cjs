const bs58 = require('bs58');

function privateKeyArrayToBase58(privateKeyArray) {
  const uint8Array = new Uint8Array(privateKeyArray);
  console.log(bs58)
  return bs58.default.encode(uint8Array);
}
