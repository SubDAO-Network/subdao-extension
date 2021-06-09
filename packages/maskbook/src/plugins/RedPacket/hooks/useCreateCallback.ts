import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, EtherTokenDetailed, TransactionEventType, SubdaoTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { SubdaoTokenDetailed } from '../../../polkadot/constants'
import Services from '../../../extension/service'
import { last, get } from 'lodash-es'
import { EthereumMessages } from '../../Ethereum/messages'

export interface RedPacketSettings {
    password: string
    shares: number
    endTime: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: EtherTokenDetailed | ERC20TokenDetailed | SubdaoTokenDetailed
    rpid?: string
}

export function useCreateCallback(redPacketSettings: RedPacketSettings) {
    const account = useAccount()
    const [createState, setCreateState] = useTransactionState()
    const { value: redPacketContract } = useSubRedPacketContract()
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)

    const createCallback = useCallback(async () => {
        const { password, isRandom, endTime, message, name, shares, total, token } = redPacketSettings

        if (!token || !redPacketContract) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error handling
        if (new BigNumber(total).isLessThan(shares)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least [number of red packets] tokens to your red packet.'),
            })
            return
        }
        if (shares <= 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('At least 1 person should be able to claim the red packet.'),
            })
            return
        }
        if (token.type !== SubdaoTokenType.SubDAO && token.type !== SubdaoTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('Token not supported'),
            })
            return
        }

        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const params = {
            token_type: token.type === SubdaoTokenType.SubDAO ? 0 : 1,
            if_random: isRandom,
            total_number: shares,
            end_time: endTime,
            token_addr: token.type === SubdaoTokenType.SubDAO ? account : token.address,
            total_tokens: total,
            password: Web3Utils.sha3(password)!,
        }
        console.log(`params...`, params)

        return new Promise<void>(async (resolve, reject) => {
            const result: any = await Services.Polkadot.createRedPacket(params)
            console.log(`create result...`, result)
            if (result.status.finalized) {
                let rid = Number(get(last(result.contractEvents), 'args[0]', '0'))
                console.log({ rid })
                setCreateSettings({
                    rpid: `${Number(get(last(result.contractEvents), 'args[0]', '0'))}`,
                    ...redPacketSettings,
                })
                setCreateState({
                    type: TransactionStateType.FINALIZED,
                })
                // EthereumMessages.events.transactionDialogUpdated.sendToAll(result.events)
                resolve()
            }
        })
    }, [account, setCreateState, redPacketContract, redPacketSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [setCreateState])

    return [createSettings, createState, createCallback, resetCallback] as const
}
