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
        default:
            return
    }
}

export function resolveChainName(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'Mainnet'
        default:
            safeUnreachable(chainId)
            return 'Unknown'
    }
}

export function resolveChainColor(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'rgb(41, 182, 175)'
        default:
            return 'silver'
    }
}

export function resolveLinkOnEtherscan(chainId: ChainId) {
    switch (chainId) {
        case ChainId.Mainnet:
            return 'https://etherscan.io'
        default:
            safeUnreachable(chainId)
            return 'https://etherscan.io'
    }
}

export function resolveTransactionLinkOnEtherscan(chainId: ChainId, tx: string) {
    return `${resolveLinkOnEtherscan(chainId)}/tx/${tx}`
}

export function resolveTokenLinkOnEtherscan(token: EtherToken | ERC20Token | ERC721Token) {
    return `${resolveLinkOnEtherscan(token.chainId)}/token/${token.address}`
}
