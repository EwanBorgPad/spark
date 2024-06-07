
# Questions:

Write down all questions and answers here.  
The format isn't perfect, feel free to refactor at any time.  

## Data storage
- Q: What data are we going to store in the database (rather than the chain itself)? This is important for decisions on system architecture.
    - If we don't need a database, edge deployments make more sense
    - If we need a database, edge deployments may prove counter-productive because of greater server-database latency (at least for traditional centralized databases)
- Storing data on the chain may be expensive

## Business questions
- Q: Whitelisted - do we keep the whitelist list in our database?
  - A: No, there will be a way to determine if someone is whitelisted based on their actions on the chain probably.
- Q: Can there be multiple events (for multiple projects) at the same time? How do we handle that?
  - A: For the MVP only one event (probably for Agora company) 
- Q: Are we gonna use Wallet Connect for authentication (same as last year)? And subquestion, should we use SIWE or something else? Does SIWE work with Solana (instead of Ethereum)?
  - A: No, try Phantom and Backpack respectively.
- Q: Are we definitely going with Solana chain exclusively? No Ethereum?
  - A: Looks like it.
- Q: Which languages are supported? 
  - A: Only EN for now, but probably more in the future

## Architecture meeting

We've done a lot of UI work, what we could from the designs, and are starting work on infrastructure and the backend so we have some questions

### Data questions
- Q: Where does the user's balance come from? Is Borg implemented as token on Solana (SPL)? What's the address?
  - Borg is a bridge token, but yes it is compatible with SPL.
  - Borg address: https://solscan.io/token/3dQTr7ror2QPKQ3GbBCokJUmjErGg8kTJzdnYjNfvi3Z
  - GetBalance api: https://solana.com/docs/rpc/http/getbalance
- Q: Users are gonna use Borg exclusively?
  - Yes.
- Q: Where does project data come from (can we hardcode the configuration for the MVP)?
  - Hardcode.
- Q: Static assets hosting (images)? the simplest is to host them as frontend assets (main question is dynamic/static)
  - Hardcode, deploy as static resources in frontend.
- Q: When the User creates an order, what happens (api call, chain interaction, smart contracts)?
  - It all happens on chain
  - This link was provided, might be irrelevant now, but let's keep it https://github.com/orca-so/orca-sdks
  - We'll organize a workshop with one of SB engineers to resolve this questions.
  - Nicolas will handle this by EOW (end of May 2025).
- Q: What data are we gonna store in the database (rather than the chain itself)?
  - We might not need a datastore after all. 
  - Public RPC to be able to make the queries, Nicolas will give us this.
  - https://solana.com/docs/rpc
  - https://solana.com/docs/rpc/http
  - https://solana.com/docs/rpc/http/getbalance
  - Possibly try to use D1 for caching, as rpc calls might be slow, BUT avoid premature optimization.
- Q: Past orders info? Database or chain?
  - https://dex.zeta.markets/trade/SOL-PERP 

### Architecture questions
- Q: How do we test this, is there a staging environment (testnet, devnet)?
  - We will get this later (on the workshop with their engineers possibly).
- Q: Do we need Cloudflare Workers (depends on the above's answer)? What would they do (auth + db write?)?
  - We probably won't need them if we don't use the database.
- Q: I wanna go with this https://developers.cloudflare.com/pages/functions/?
  - Yes.
- Q: Will the app communicate with SwissBorg backend (rather than smart contracts)?
  - No.
- Q: Sign in with Solana (https://siws.web3auth.io/)? I guess we're going to need this if we're authorizing our users on the backend
  - This will be relevant if we include some backend api endpoints (that need authorization).
- JSON Data Model (data.ts)

























