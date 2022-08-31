import * as base from '@solana/wallet-adapter-base'
import * as Base58 from 'base-58'
import * as  nacl from 'tweetnacl'


// DWT - decentralized web token
export type DWT = {
  chain: string // chain (solana, eth...)
  ini: number // creation date
  exp: number //expiration 
  domain: string // app domain
}

//Sign a Decentralized Web Token based on Wallet
export async function sign(
  wallet: base.WalletAdapterProps,
  dwt: DWT,
): Promise<string | Error> {
  try {
    const castWallet: base.BaseMessageSignerWalletAdapter =
      wallet as base.BaseMessageSignerWalletAdapter
    if (wallet.publicKey === null) {
      throw 'Wallet is null'
    }
    const encodedPublicKey: Uint8Array = wallet.publicKey.toBytes()
    const encodedBody: Uint8Array = new TextEncoder().encode(
      JSON.stringify(dwt),
    )
    const encodedSignature: Uint8Array = await castWallet.signMessage(
      encodedBody,
    )
    return [
      Base58.encode(encodedPublicKey),
      Base58.encode(encodedBody),
      Base58.encode(encodedSignature),
    ].join('.')
  } catch (err: any) {
    console.error(err)
    return new Error(err)
  }
}

export interface decodedToken {
  publicKey: string
  dwt: DWT
}
export function decode(rawToken: string): decodedToken | null {
  try {
    const sections: string[] = rawToken.split('.')
    //must contains exactly three sections
    if (sections.length !== 3) {
      console.warn('invalid number of sections in token')
      return null
    }

    const publicKey: string = sections[0]
    const decodedBody: Uint8Array = Base58.decode(sections[1])
    const dwt: DWT = JSON.parse(new TextDecoder().decode(decodedBody))

    let decoded : decodedToken = {
      publicKey: publicKey,
      dwt: dwt,
    }
    return decoded
  } catch (err) {
    console.error(err)
    return null
  }
}
// verify a raw token true if valid/false if not valid
export async function verify(rawToken: string): Promise<boolean> {
  try {
    const sections: string[] = rawToken.split('.')
    //must contains exactly three sections
    if (sections.length !== 3) {
      console.warn('invalid number of sections in token')
      return false
    }

    const decodedPublicKey: Uint8Array = Base58.decode(sections[0])
    const decodedBody: Uint8Array = Base58.decode(sections[1])
    const decodedSignature: Uint8Array = Base58.decode(sections[2])

    // no section must be empty
    if (
      decodedPublicKey.length < 2 ||
      decodedBody.length < 2 ||
      decodedSignature.length < 2
    ) {
      console.warn('invalid section format')
      return false
    }

    const dwt: DWT = JSON.parse(new TextDecoder().decode(decodedBody))
    const now = new Date().getTime()
    // must not be expired
    if (dwt.exp < now) {
      console.warn('dwt is expired')
      return false
    }

    return nacl.sign.detached.verify(
      decodedBody,
      decodedSignature,
      decodedPublicKey,
    )
  } catch (err) {
    console.error(err)
    return false
  }
}
