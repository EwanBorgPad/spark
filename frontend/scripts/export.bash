# investment intent export
npx wrangler d1 execute borgpad-production-database --remote --command "SELECT
    address,
    json -> 'investmentIntent' -> 'solana-id' ->> 'amount' AS investment_interest_amount,
    json -> 'investmentIntent' -> 'solana-id' ->> 'providedAt' AS investment_interest_provided_at,
    json -> 'termsOfUse' ->> 'countryOfOrigin' AS terms_of_use_country_of_origin
    json -> 'termsOfUse' ->> 'acceptedAt' AS terms_of_use_accepted_at
FROM user;" &> "export_$(date -u +%Y%m%d_%H%M%S).json"

# users by country export
npx wrangler d1 execute borgpad-production-database --remote --command "SELECT
    json -> 'termsOfUse' ->> 'countryOfOrigin' AS countryOfOrigin,
    COUNT(*)
FROM user
GROUP BY json -> 'termsOfUse' ->> 'countryOfOrigin'
ORDER BY COUNT(*) DESC;" &> "export_$(date -u +%Y%m%d_%H%M%S).json"
