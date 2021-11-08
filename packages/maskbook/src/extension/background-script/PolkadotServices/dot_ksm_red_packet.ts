import { getApi } from './base'
import { redPacketAddress, redPacketUrl, networkNativeTokens, SubstrateNetwork } from '../../../polkadot/constants'
import { getSigner } from './sign'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'

export const createDotOrKsmRedPacket = async (params: any) => {
    const api = await getApi()
    if (!api) return
    const signer = await getSigner()
    const network = currentSubstrateNetworkSettings.value
    if (network !== SubstrateNetwork.Polkadot && network !== SubstrateNetwork.Kusama) return

    const txHash = await api.tx.balances.transfer(redPacketAddress[network], params.total).signAndSend(signer)
    if (!txHash) return

    const createRedPacketApi = `${redPacketUrl}/redpacket/create`
    const data = {
        sender: params.sender,
        tokenAmount: params.total,
        chainType: networkNativeTokens[network].symbol,
        transHash: txHash.toHex(),
        redPacketNumber: params.shares.toString(),
    }
    try {
        const res = await fetch(createRedPacketApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const info = await res.json()
        return info
    } catch (err) {
        console.log(`create ${network} red packet err...`, err)
    }
}

export const checkDotOrKsmRedPacket = async (redPacketId: string) => {
    const network = currentSubstrateNetworkSettings.value
    if (network !== SubstrateNetwork.Polkadot && network !== SubstrateNetwork.Kusama) return

    const getRedPacketApi = `${redPacketUrl}/redpacket/info/${redPacketId}`
    try {
        const res = await fetch(getRedPacketApi)
        const info = await res.json()
        console.log(`red packet info...`, info)
        return info
    } catch (err) {
        console.log(`get ${network} red packet err...`, err)
    }
}

export const claimDotOrKsmRedPacket = async (params: { receiver: string; redPacketId: string }) => {
    const network = currentSubstrateNetworkSettings.value
    if (network !== SubstrateNetwork.Polkadot && network !== SubstrateNetwork.Kusama) return
    const claimRedPacketApi = `${redPacketUrl}/redpacket/receive`
    try {
        const res = await fetch(claimRedPacketApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        })
        const info = await res.json()
        console.log(`claim info`, info)
        return info
    } catch (err) {
        console.log(`claim ${network} red packet err...`, err)
    }
}

export const refundDotOrKsmRedPacket = async (params: { sender: string; redPacketId: string }) => {
    const network = currentSubstrateNetworkSettings.value
    if (network !== SubstrateNetwork.Polkadot && network !== SubstrateNetwork.Kusama) return

    const claimRedPacketApi = `${redPacketUrl}/redpacket/return`
    try {
        const res = await fetch(claimRedPacketApi, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
        })
        const info = await res.json()
        console.log(`refund info`, info)
        return info
    } catch (err) {
        console.log(`refund ${network} red packet err...`, err)
    }
}
