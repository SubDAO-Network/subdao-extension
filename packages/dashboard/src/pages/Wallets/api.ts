import { createGlobalState } from '@subdao/maskbook-shared'
import { PluginMessages, PluginServices } from '../../API'

export const [useWallets, revalidateWallets, wallets] = createGlobalState(
    PluginServices.Wallet.getWallets,
    PluginMessages.Wallet.events.walletsUpdated.on,
)
