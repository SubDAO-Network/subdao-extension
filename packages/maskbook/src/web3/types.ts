import type createMetaMaskProvider from '@dimensiondev/metamask-extension-provider'

export enum ProviderType {
    SubDAO = 'SubDAO',
    Polkadot = 'Polkadot',
    Kusama = 'Kusama',
    MetaMask = 'MetaMask',
    WalletConnect = 'WalletConnect',
}

export enum CurrencyType {
    USD = 'usd',
}

export interface MetaMaskInpageProvider extends UnboxPromise<ReturnType<typeof createMetaMaskProvider>> {
    _metamask: { isUnlocked: () => Promise<boolean> }
}

//#region Ether
export interface EtherToken {
    type: EthereumTokenType.Ether
    address: string
    chainId: ChainId
}

export interface EtherTokenDetailed extends EtherToken {
    name: ''
    symbol: 'Unit'
    decimals: 15
}
//#endregion

//#region ERC20
export interface ERC20Token {
    type: EthereumTokenType.ERC20
    address: string
    chainId: ChainId
}

export interface ERC20TokenDetailed extends ERC20Token {
    name?: string
    symbol?: string
    decimals: number
    total?: number
}
//#endregion

//#region ERC721
export interface ERC721Token {
    type: EthereumTokenType.ERC721
    address: string
    chainId: ChainId
}
export interface ERC721TokenDetailed extends ERC721Token {
    name: string
    symbol: string
    baseURI: string
}
//#endregion

interface TokenDetailedMap {
    [EthereumTokenType.Ether]: EtherTokenDetailed
    [EthereumTokenType.ERC20]: ERC20TokenDetailed
    [EthereumTokenType.ERC721]: ERC721TokenDetailed
}

export type TokenDetailedType<T extends EthereumTokenType> = TokenDetailedMap[T]

export interface AssetDetailed {
    token: EtherTokenDetailed | ERC20TokenDetailed
    /**
     * The total balance of token
     */
    balance: string
    /**
     * The estimated price
     */
    price?: {
        [key in CurrencyType]: string
    }
    /**
     * The estimated value
     */
    value?: {
        [key in CurrencyType]: string
    }
    logoURL?: string
}

// Learn more about ethereum ChainId https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
export enum ChainId {
    Mainnet = 1,
    SubDAO = 42,
    Polkadot = 0,
    Kusama = 2,
}

// Please don't use this enum but use ChainId instead
// this exists for back backward compatible
export enum EthereumNetwork {
    Mainnet = 'Mainnet',
}

export enum EthereumTokenType {
    Ether = 0,
    ERC20 = 1,
    ERC721 = 2,
}

export enum TransactionEventType {
    TRANSACTION_HASH = 'transactionHash',
    RECEIPT = 'receipt',
    CONFIRMATION = 'confirmation',
    ERROR = 'error',
}

export enum SubdaoTokenType {
    SubDAO = 0,
    ERC20 = 1,
}
