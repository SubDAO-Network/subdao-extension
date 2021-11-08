import { getApi } from './base'
import { redPacketAddress, redPacketUrl, networkNativeTokens } from '../../../polkadot/constants'
import { getSigner } from './sign'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'

export const createDotOrKsmRedPacket = async (params: any) => {
    const api = await getApi()
    if (!api) return
    const signer = await getSigner()
    const network = currentSubstrateNetworkSettings.value
    const txHash = await api.tx.balances.transfer(redPacketAddress[network], params.total).signAndSend(signer)
    const createRedPacket = `${redPacketUrl}/redpacket/create`
    const data = {
        sender: params.sender,
        tokenAmount: params.total,
        chainType: networkNativeTokens[network].symbol,
        transHash: txHash.toHex(),
        redPacketNumber: params.shares.toString(),
    }
    console.log(`data...`, data)
    const res = await fetch(createRedPacket, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    const info = await res.json()
    console.log(`info...`, info)
    return info
}
