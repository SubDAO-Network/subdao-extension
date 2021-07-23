import type { KeypairType } from '@polkadot/util-crypto/types'

export interface SubdaoTokenDetailed {
    name: string
    symbol: string
    decimals: number
    type: number
    chainId: number
    address: string
}

export const ws_server = 'wss://alpha.subdao.org'

export const mainAddress = {
    main: '5E28THM8Nde4ngcVQ2LGoUf5Hf7sLFyEBuuUXgRpPnbCoTRZ',
}
export const ERC20_TOKEN_LISTS = ['https://raw.githubusercontent.com/SubDAO-Network/token-list/main/subdao.json']

export const voteAddress = {
    // Bilibili address
    // main: '5HqqyAwLfqVLb7XB4NF3JqdHRFJSLc465hYbh8Bnh4fXMHhs',
}

export const redPacketAddress = {
    main: '5HRpVAKhuFyFbZLJBmGDrQ8uBqzBJLggWhFpxrQWcbgzYn6U',
}

export const erc20Address = {
    test: '5DCyzSLBMpYMeFpVHDKjPEVh3vuu2D3Ku4VMqaDUz3VtZ87N',
}

export const tokenDetail = {
    address: mainAddress.main,
    name: '',
    decimals: 15,
    symbol: 'unit',
    type: 0,
    chainId: 1,
}

export const ss58Format = 42
export const keypairType: KeypairType = 'sr25519'
