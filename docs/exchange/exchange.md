# Exchange

For currency exchange data the CoinGecko free API is used. 

To mitigate API rate limits, a caching mechanism has been implemented using the database. On the first request, data is fetched from origin server (CoinGecko API) and stored in the database. Subsequent requests within a 30-second interval are served from the cached data. The cache expiration time may be adjusted in the production environment.

Exchange API: https://api.coingecko.com/api/v3/coins/markets?ids=swissborg&vs_currency=usd

[Solution Diagram](./exchange.svg)
