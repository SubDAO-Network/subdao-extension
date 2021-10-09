import stringify from 'json-stable-stringify'
import type { WalletRecord, ERC20TokenRecord } from './database/types'
import { currentSelectedWalletAddressSettings, currentSelectedWalletProviderSettings } from './settings'
import { currentSubstrateNetworkSettings } from '../../settings/settings'
import { isSameAddress } from '../../web3/helpers'
import { ProviderType } from '../../web3/types'
import { WalletMessages, WalletRPC } from './messages'
import { SubstrateNetwork, SubstrateNetworkPrefix } from '../../polkadot/constants'

function serializeWalletRecord(record: WalletRecord) {
    return stringify({
        ...record,
    })
}

export function WalletComparer(a: WalletRecord | null, b: WalletRecord | null) {
    if (!a || !b) return false
    return serializeWalletRecord(a) === serializeWalletRecord(b)
}

export function WalletArrayComparer(a: WalletRecord[], b: WalletRecord[]) {
    if (a.length !== b.length) return false
    return a.every((wallet, index) => WalletComparer(wallet, b[index]))
}

export function TokenComparer(a: ERC20TokenRecord | null, b: ERC20TokenRecord | null) {
    if (!a || !b) return false
    return isSameAddress(a.address, b.address)
}

export function TokenArrayComparer(a: ERC20TokenRecord[], b: ERC20TokenRecord[]) {
    if (a.length !== b.length) return false
    return a.every((token, index) => TokenComparer(token, b[index]))
}

export function selectSubDAOWallet(wallet: WalletRecord) {
    currentSelectedWalletAddressSettings.value = wallet.address
    let network = SubstrateNetwork.SubDAO
    let provider = ProviderType.SubDAO
    if (wallet.networkPrefix === SubstrateNetworkPrefix.Polkadot) {
        network = SubstrateNetwork.Polkadot
        provider = ProviderType.Polkadot
    }
    if (wallet.networkPrefix === SubstrateNetworkPrefix.Kusama) {
        network = SubstrateNetwork.Kusama
        provider = ProviderType.Kusama
    }
    currentSubstrateNetworkSettings.value = network
    currentSelectedWalletProviderSettings.value = provider
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function getWallets(provider: ProviderType = ProviderType.SubDAO) {
    const wallets = await WalletRPC.getWallets()
    if (provider === ProviderType.SubDAO) {
        return wallets.filter((x) => x.networkPrefix === undefined || x.networkPrefix === SubstrateNetworkPrefix.SubDAO)
    }

    if (provider === ProviderType.Polkadot) {
        return wallets.filter((x) => x.networkPrefix === SubstrateNetworkPrefix.Polkadot)
    }

    if (provider === ProviderType.Kusama) {
        return wallets.filter((x) => x.networkPrefix === SubstrateNetworkPrefix.Kusama)
    }

    return wallets
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
