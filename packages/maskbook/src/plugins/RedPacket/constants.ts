import { ChainId } from '../../web3/types'

/** DON'T CHANGE IT. */
export const RedPacketMetaKey = 'com.subdao.red_packet:1'
export const RedPacketPluginID = 'com.subdao.red_packet'

export const RED_PACKET_CONSTANTS = {
    HAPPY_RED_PACKET_ADDRESS: {
        [ChainId.Mainnet]: '5Feh3kEy5KLz4H9EUa7GMJJWyrgPuTS2Zz4yZaVYmDLYoh5U',
    },
}

export const RED_PACKET_CONTRACT_VERSION = 1

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 999

export const RED_PACKET_HISTORY_URL = 'https://service.r2d2.to/red-packet-history'
export const RED_PACKET_HISTROY_MAX_BLOCK_SIZE = Math.floor(
    (30 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60) /* seconds */ / 15 /* each block in seconds */,
)
