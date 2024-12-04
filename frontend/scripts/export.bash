# solana-id
npx wrangler d1 execute borgpad-production-database --remote --command "SELECT
  address,
  json -> 'investmentIntent' -> 'solana-id' ->> 'amount' AS investment_interest_amount,
  json -> 'investmentIntent' -> 'solana-id' ->> 'providedAt' AS investment_interest_provided_at,
  json -> 'termsOfUse' ->> 'countryOfOrigin' AS terms_of_use_country_of_origin,
  json -> 'termsOfUse' ->> 'acceptedAt' AS terms_of_use_accepted_at,
  json -> 'referral' -> 'solana-id' ->> 'referrerTwitterHandle' AS referrer
FROM user;" &> "export_solana-id_$(date -u +%Y%m%d_%H%M%S).json"

# moemate
npx wrangler d1 execute borgpad-production-database --remote --command "SELECT
  address,
  json -> 'investmentIntent' -> 'moemate' ->> 'amount' AS investment_interest_amount,
  json -> 'investmentIntent' -> 'moemate' ->> 'providedAt' AS investment_interest_provided_at,
  json -> 'termsOfUse' ->> 'countryOfOrigin' AS terms_of_use_country_of_origin,
  json -> 'termsOfUse' ->> 'acceptedAt' AS terms_of_use_accepted_at,
  json -> 'referral' -> 'moemate' ->> 'referrerTwitterHandle' AS referrer
FROM user
WHERE json -> 'investmentIntent' -> 'moemate' IS NOT NULL;" &> "export_moemate_$(date -u +%Y%m%d_%H%M%S).json"
