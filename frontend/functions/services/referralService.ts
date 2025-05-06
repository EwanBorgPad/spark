// Using Web Crypto API instead of Node.js crypto
// Secret key for generating referral codes - now coming from environment variables

interface Environment {
  REFERRAL_SECRET_KEY: string;
  [key: string]: any;
}

const getSecretKey = (env: Environment): string => {
  // Use environment variable or fallback to default for development only
  return env?.REFERRAL_SECRET_KEY;
}

/**
 * Generates a short referral code from a user's address
 * @param address The user's wallet address
 * @param env The environment object containing secrets
 * @returns A short referral code
 */
export function generateReferralCode(address: string, env: Environment): string {
  const secretKey = getSecretKey(env);
  
  // Create a hash of the address using the secret key
  const encoder = new TextEncoder();
  const data = encoder.encode(address + secretKey);
  
  // Using a simplified approach since SubtleCrypto is asynchronous
  // and exported functions need to be synchronous
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hexadecimal and take the first 8 characters
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return hexHash.substring(0, 8);
}

/**
 * Validates if a referral code is valid for a given address
 * @param code The referral code to validate
 * @param address The address to check against
 * @param env The environment object containing secrets
 * @returns True if the code is valid for the address
 */
export function validateReferralCode(code: string, address: string, env: Environment): boolean {
  const expectedCode = generateReferralCode(address, env);
  return code === expectedCode;
}

/**
 * Gets a referral code for a user
 * @param address The user's address
 * @param env The environment object containing secrets
 * @returns The referral code
 */
export function getReferralCode(address: string, env: Environment): string {
  return generateReferralCode(address, env);
}

interface UserRecord {
  address: string;
  [key: string]: unknown;
}

/**
 * Gets the address of a user by their referral code
 * @param db The database connection
 * @param code The referral code
 * @param env The environment object containing secrets
 * @returns The address of the user who owns this code, or null if not found
 */
export async function getAddressByReferralCode(db: D1Database, code: string, env: Environment): Promise<string | null> {
  // This approach is not efficient for large databases, but avoids storing codes
  const users = await db
    .prepare("SELECT address FROM user")
    .all();
  
  if (!users || !users.results) return null;
  
  for (const user of users.results) {
    // Safely check that user has an address property
    if (typeof user === 'object' && user !== null && 'address' in user) {
      const userAddress = user.address as string;
      if (generateReferralCode(userAddress, env) === code) {
        return userAddress;
      }
    }
  }
  
  return null;
} 