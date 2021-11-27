import { ChainId, ERC20Token, ERC721Token, EtherToken, ProviderType } from './types'
import { safeUnreachable } from '../utils/utils'

export function resolveProviderName(providerType: ProviderType) {
    switch (providerType) {
        case ProviderType.SubDAO:
            return 'SubDAO'
        case ProviderType.Polkadot:
            return 'Polkadot'
        case ProviderType.Kusama:
            return 'Kusama'
        case ProviderType.MetaMask:
            return 'MetaMask'
        case ProviderType.WalletConnect:
            return 'WalletConnect'
        default:
            safeUnreachable(providerType)
            return 'Unknown'
    }
}

export function resolveChainId(name: string) {
    switch (name.toLowerCase()) {
        case 'mainnet':
            return ChainId.Mainnet
        case 'subdao':
            return ChainId.SubDAO
        case 'kusama':
            return ChainId.Kusama
        case 'polkadot':
            return ChainId.Polkadot
        default:
            return
    }
}

export function resolveChainName(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'Mainnet'
        case ChainId.SubDAO:
            return 'SubDAO'
        case ChainId.Kusama:
            return 'Kusama'
        case ChainId.Polkadot:
            return 'Polkadot'
        default:
            return 'Unknown'
    }
}

export function resolveChainColor(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'rgb(41, 182, 175)'
        case ChainId.SubDAO:
            return '#D52473'
        case ChainId.Kusama:
            return '#000000'
        case ChainId.Polkadot:
            return '#FF8C00'
        default:
            return 'silver'
    }
}

export function resolveLinkOnEtherscan(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://etherscan.io'
        default:
            return 'https://etherscan.io'
    }
}

export function resolveTransactionLinkOnEtherscan(chainId: ChainId, tx: string) {
    return `${resolveLinkOnEtherscan(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: EtherToken | ERC20Token | ERC721Token) {
    return `${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`
}
