import type { KeypairType } from '@polkadot/util-crypto/types'

export interface SubdaoTokenDetailed {
    name: string
    symbol: string
    decimals: number
    type: number
    chainId: number
    address: string
}

export const ws_server = 'ws://39.101.70.206:9944'

export const mainAddress = {
    // main: '5GJ4SURhRyyGS4cZwwMi4x5L2xskb4364DuvPCQrBmnfwshB',
    main: '5GodmyTkVKacMjhfmYHS2FgRj5SHLnwJZhobhuA69Q99EPqd',
}
export const ERC20_TOKEN_LISTS = ['https://raw.githubusercontent.com/SubDAO-Network/token-list/main/subdao.json']

export const voteAddress = {
    // Bilibili address
    // main: '5HqqyAwLfqVLb7XB4NF3JqdHRFJSLc465hYbh8Bnh4fXMHhs',
}

export const redPacketAddress = {
    // main: '5HD1edgAbVurBi2Drn1jZjoWrNBtfqWCvCXeETNvc5JWmy6A',
    main: '5CGd7wAsen8kn4tZ5HQQCnRC3PoUDFjwQwUUQEr5JjpBs7ZK',
}

export const erc20Address = {
    // Test Address
    // test: '5HS33aRib3zndQKTe22nnfqsjE4QCBYa8jTioxNU3ExqUHkT',
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
