
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
