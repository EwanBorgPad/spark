
# Questions:

Write down all questions and answers here.  
The format isn't perfect, feel free to refactor at any time.  

### Data storage
- Q: What data are we going to store in the database (rather than the chain itself)? This is important for decisions on system architecture.
    - If we don't need a database, edge deployments make more sense
    - If we need a database, edge deployments may prove counter-productive because of greater server-database latency (at least for traditional centralized databases)
- Storing data on the chain may be expensive

### Business questions
- Q: Whitelisted - do we keep the whitelist list in our database?
- Q: Can there be multiple events (for multiple projects) at the same time? How do we handle that?
  - A: For the MVP only one event (probably for Agora company) 
