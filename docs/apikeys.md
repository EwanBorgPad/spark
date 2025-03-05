# API Keys WIP

This document describes the implementation of API Keys and the reasoning behind it.

Wanted features:
- self-descriptive (contains name)
- non-retrievable (readable only once, hash stored in the db)
- selectable by double-click (no dashes, slashes, backslashes...)

## Shape

- Creation
- Generate a unique string
    - 16bytes (128bits) has more randomness than an UUID making it non-guessable enough
    - hex is chosen to avoid special characters
- Build the api key (by format)
- Hash the api key using SHA-256 or bcrypt
- Store the key id and hash in the database 

```javascript
const crypto = require("crypto");

const apiKey = crypto.randomBytes(16).toString("hex");
console.log(apiKey);
```
Format: sk_NAME_SECRET

`sk_peter_prod_8iam21k8f7v6s5sbxg134`

Database structure 

---
| id              | hash                  | created_at        | updated_at        |
| --------------- | --------------------- | ----------------- | ----------------- |
| sk_peter_prod   | 1k23k1093k1302i9k     | 2025-03-04 10:00  | 2025-03-04 10:00  |
| sk_peter_dev    | 2k14g2384k1403v2g     | 2025-03-03 09:00  | 2025-03-03 09:00  |
| sk_john_test    | 3h42j0928k1302s4l     | 2025-03-01 08:00  | 2025-03-01 08:00  |
---


Inspiration: Stripe https://docs.stripe.com/keys