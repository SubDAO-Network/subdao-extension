import { ValueRef } from '@dimensiondev/holoflows-kit'
import { WalletMessages, WalletRPC } from '../messages'
import { ProviderType } from '../../../web3/types'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { WalletRecord } from '../database/types'
import { WalletArrayComparer } from '../helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings } from '../settings'

import { SubstrateNetworkPrefix } from '../../../polkadot/constants'

//#region tracking wallets
const walletsRef = new ValueRef<WalletRecord[]>([], WalletArrayComparer)
async function revalidate() {
    walletsRef.value = await WalletRPC.getWallets()
}
WalletMessages.events.walletsUpdated.on(revalidate)
revalidate()
//#endregion

export function useWallet(address?: string) {
    const address_ = useValueRef(currentSelectedWalletAddressSettings)
    const wallets = useWallets()
    return wallets.find((x) => isSameAddress(x.address, address ?? address_))
}

export function useWallets(provider?: ProviderType) {
    const wallets = useValueRef(walletsRef)
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
