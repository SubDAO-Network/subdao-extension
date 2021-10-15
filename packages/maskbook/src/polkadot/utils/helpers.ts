import { mainAddress, SubstrateNetwork, SubstrateNetworkPrefix } from '../constants'
import { ProviderType } from '../../web3/types'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isSubdaoAddress(address: string) {
    const firstLetter = address.substr(0, 1)
    if (parseInt(firstLetter) === 1) {
        return true
    }
    if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.includes(firstLetter)) {
        return true
    }
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

export function getNetwork(provider?: ProviderType) {
    if (provider === ProviderType.Polkadot) {
        return SubstrateNetwork.Polkadot
    }
    if (provider === ProviderType.Kusama) {
        return SubstrateNetwork.Kusama
    }
    return SubstrateNetwork.SubDAO
}
