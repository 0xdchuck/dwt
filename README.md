# DWT

Decentralized Web Token a library to craft and validate DWT. Allowing user to authenticate with Wallet.

**Warning** This library is still in Beta, use it at your own risk

## Why?

Read: <https://viewww.page/blog/DWT>

### Format

```typescript

// DWT - decentralized web token
export type DWT = {
  chain: string // chain (solana, eth...)
  ini: number // creation date
  exp: number //expiration 
  domain: string // app domain
}

```
