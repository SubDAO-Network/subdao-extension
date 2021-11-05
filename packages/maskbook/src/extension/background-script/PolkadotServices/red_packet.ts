import ConnectContract from '../../../polkadot/connect'
import { ContractType } from '../../../polkadot/types'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { getApi } from './base'
import { redPacketAddress, redPacketUrl, networkNativeTokens } from '../../../polkadot/constants'
import { getSigner, getNonce } from './sign'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'

const value = 0
const gasLimit = -1

export const getRedPacketContract = async () => {
    const api = await getApi()
    if (!api) return
    return await ConnectContract(api, ContractType.redPacket, redPacketAddress.SubDAO)
}

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

export const createRedPacket = async (params: any) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const redPacketContract = await getRedPacketContract()
    if (!redPacketContract) return

    const signer = await getSigner()
    const nonce = await getNonce()

    const { token_type, if_random, total_number, end_time, token_addr, total_tokens, password } = params
    return new Promise(async (resolve, reject) => {
        await (redPacketContract as any)
            ?.exec(
                'create_red_packet',
                { value, gasLimit },
                token_type,
                if_random,
                total_number,
                end_time,
                token_addr,
                total_tokens,
                password,
            )
            .signAndSend(signer, { nonce }, (res: any) => {
                console.log(`create_red_packet res`, res)
                console.log(`res?.status?.isFinalized`, res?.status?.isFinalized)
                if (res?.status?.isFinalized) {
                    if (!res.contractEvents) {
                        console.error(res.events)
                        reject(res.events)
                    }
                    resolve(res)
                }
            })
    })
}

export const checkRedPacket = async (id: string) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const redPacketContract = await getRedPacketContract()
    if (!redPacketContract) return

    const data = await (redPacketContract as any)?.query?.checkRedPacket(address, { value, gasLimit }, parseInt(id))
    console.log(`red packet details`, data?.output?.toString())
    return data?.output?.toString()
}

export const claimRedPacket = async (params: any) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const redPacketContract = await getRedPacketContract()
    if (!redPacketContract) return

    const signer = await getSigner()
    const nonce = await getNonce()
    const { id, password, recipient } = params
    return new Promise(async (resolve, reject) => {
        await (redPacketContract as any)
            ?.exec('claim', { value, gasLimit }, id, password, recipient)
            .signAndSend(signer, { nonce }, (res: any) => {
                console.log(`claim res`, res)
                console.log(`res?.status?.isFinalized`, res?.status?.isFinalized)
                if (res?.status?.isFinalized) {
                    resolve('finalized')
                }
            })
    })
}

export const refundRedPacket = async (id: string) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const redPacketContract = await getRedPacketContract()
    if (!redPacketContract) return

    const signer = await getSigner()
    const nonce = await getNonce()
    return new Promise(async (resolve, reject) => {
        await (redPacketContract as any)
            ?.exec('refund', { value, gasLimit }, id)
            .signAndSend(signer, { nonce }, (res: any) => {
                if (res?.status?.isFinalized) {
                    resolve('finalized')
                }
            })
    })
}
