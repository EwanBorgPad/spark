
# Anchor

## Introduction

The Anchor framework uses Rust macros to reduce boilerplate code and simplify the implementation of common security checks required for writing Solana programs.

Think of Anchor as a framework for Solana programs much like Next.js is for web development. Just as Next.js allows developers to create websites using React instead of relying solely on HTML and TypeScript, Anchor provides a set of tools and abstractions that make building Solana programs more intuitive and secure.

- [Anchor](https://solana.com/developers/guides/getstarted/intro-to-anchor)
- [IDL File](https://solana.com/developers/guides/getstarted/intro-to-anchor#idl-file)
- [Anchor Client](https://solana.com/developers/guides/getstarted/intro-to-anchor#client)
- [Intro to Anchor Frontend](https://www.soldev.app/course/intro-to-anchor-frontend)

### Problem1

```
Console    >> Error: This function requires the `Provider` interface implementor to have a `wallet` field.
[After adding the wallet interface]
Typescript >> TS2353: Object literal may only specify known properties, and wallet does not exist in type Provider
```

### Problem2

```
Error: Reached maximum depth for account resolution
    at AccountsResolver.resolve (@coral-xyz_anchor.js?v=95939f78:10846:15)
    at async MethodsBuilder.transaction (@coral-xyz_anchor.js?v=95939f78:11370:7)
    at async testAnchor (AnchorJson.ts:394:23)
```

### Problem3

IDL file typings do not work.

## Questions

- How can we test this? 
- How do we communicate with LBP program? 
- IDL for LPB program?
- What method should be called to stake? Or is it just Borg transfer to the lbp program?
- Is there BORG on devnet?
- 
- Is it okay if I do this manually instead of using Anchor lib:
  - Anchor lib has some typing issues, reducing the value of using it
  - This should not be too hard to implement manually? (using solana/web3.js, instead of @coral-xyz/anchor)
