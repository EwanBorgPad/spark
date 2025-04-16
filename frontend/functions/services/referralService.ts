// Using Web Crypto API instead of Node.js crypto
// Secret key for generating referral codes - should be stored in environment variables
const REFERRAL_SECRET_KEY = "default-secret-key-change-in-production";

/**
 * Generates a short referral code from a user's address
 * @param address The user's wallet address
 * @returns A short referral code
 */
export function generateReferralCode(address: string): string {
  // Create a hash of the address using the secret key
  const encoder = new TextEncoder();
  const data = encoder.encode(address + REFERRAL_SECRET_KEY);
  
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
 * @returns True if the code is valid for the address
 */
export function validateReferralCode(code: string, address: string): boolean {
  const expectedCode = generateReferralCode(address);
  return code === expectedCode;
}

/**
 * Gets a referral code for a user
 * @param address The user's address
 * @returns The referral code
 */
export function getReferralCode(address: string): string {
  return generateReferralCode(address);
}

/**
 * Gets the address of a user by their referral code
 * @param db The database connection
 * @param code The referral code
 * @returns The address of the user who owns this code, or null if not found
 */
export async function getAddressByReferralCode(db: D1Database, code: string): Promise<string | null> {
  // This approach is not efficient for large databases, but avoids storing codes
  const users = await db
    .prepare("SELECT address FROM user")
    .all();
  
  if (!users || !users.results) return null;
  
  for (const user of users.results) {
    const userAddress = user.address as string;
    if (generateReferralCode(userAddress) === code) {
      return userAddress;
    }
  }
  
  return null;
} 