import { checkAddress, checkAddressChecksum } from '@polkadot/util-crypto'
import { currentSelectedWalletProviderSettings } from '../../Wallet/settings'
import { getNetworkPrefix } from '../../../polkadot/utils/helpers'

export function isValidAddress(address: string): boolean {
    const provider = currentSelectedWalletProviderSettings.value
    const ss58Format = getNetworkPrefix(provider)
    return checkAddress(address, ss58Format)[0]
}

export function isValideChecksumAddress(address: Uint8Array): boolean {
    return checkAddressChecksum(address)[0]
}

export function formatPolkadotAddress(address: string, size = 0) {
    if (!isValidAddress(address)) return address
    if (size === 0) return address
    return `${address.substr(0, 2 + size)}...${address.substr(-size)}`
}

export function formatChecksumAddress(address: string) {
    return address
}
