
# Eligibility

## Terminology

- isCompliant - user is compliant with BorgPad by completing compliance quests. Compliance quests are mandatory for all users that wish to participate 
- isWhitelisted - user is eligible to participate by being manually whitelisted by admin, but they still need to also be compliant
- hasTiered - user has made it onto one of the tiers by completing quests
- isEligible - user is eligible to participate

```
isEligible = isCompliant AND (hasTiered OR isWhitelisted)
```

- quests - the quest/task/action that the user completes in order to become eligible. Quests are in the same format for compliances and tiers. Compliance quests are hardcoded globally for all users, while tiers are dynamic/customizable to each project.
