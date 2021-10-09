import { mainAddress, SubstrateNetwork, SubstrateNetworkPrefix } from '../constants'
import { ProviderType } from '../../web3/types'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isSubdaoAddress(address: string) {
    return isSameAddress(address, mainAddress.main)
}

export function getProvider(network?: SubstrateNetwork) {
    if (network === SubstrateNetwork.Polkadot) {
        return ProviderType.Polkadot
    }
    if (network === SubstrateNetwork.Kusama) {
        return ProviderType.Kusama
    }
    return ProviderType.SubDAO
}

export function getNetworkPrefix(provider?: ProviderType) {
    if (provider === ProviderType.Polkadot) {
        return SubstrateNetworkPrefix.Polkadot
    }
    if (provider === ProviderType.Kusama) {
        return SubstrateNetworkPrefix.Kusama
    }
    return SubstrateNetworkPrefix.SubDAO
}
