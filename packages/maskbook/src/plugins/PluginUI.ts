// Please make sure you have registered your plugin service (if it need one) at ./PluginService
import type { PluginConfig } from './types'

const plugins = new Set<PluginConfig>()
export const PluginUI: ReadonlySet<PluginConfig> = plugins

import { Flags } from '../utils/flags'
import { EthereumPluginDefine } from './Ethereum/define'
import { WalletPluginDefine } from './Wallet/define'
import { RedPacketPluginDefine } from './RedPacket/define'
import { PollsPluginDefine } from './Polls/define'
import { sideEffect } from '../utils/side-effects'

sideEffect.then(() => {
    plugins.add(EthereumPluginDefine)
    plugins.add(WalletPluginDefine)
    plugins.add(RedPacketPluginDefine)
    if (Flags.poll_enabled) plugins.add(PollsPluginDefine)
})
