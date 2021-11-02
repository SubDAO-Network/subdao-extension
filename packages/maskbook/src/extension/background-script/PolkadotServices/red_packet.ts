import ConnectContract from '../../../polkadot/connect'
import { ContractType } from '../../../polkadot/types'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { getApi } from './base'
import { redPacketAddress } from '../../../polkadot/constants'
import { getSigner, getNonce } from './sign'

const value = 0
const gasLimit = -1

export const getRedPacketContract = async () => {
    const api = await getApi()
    if (!api) return
    return await ConnectContract(api, ContractType.redPacket, redPacketAddress.SubDAO)
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
