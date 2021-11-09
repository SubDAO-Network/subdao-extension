import { useCallback } from 'react'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import Web3Utils from 'web3-utils'
import Services from '../../../extension/service'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { SubstrateNetwork } from '../../../polkadot/constants'

export function useClaimCallback(from: string, id?: string, password?: string) {
    const [claimState, setClaimState] = useTransactionState()
    const { value: redPacketContract } = useSubRedPacketContract()

    const claimCallback = useCallback(async () => {
        if (!id || !password || !from) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }
        const network = currentSubstrateNetworkSettings.value
        if (network === SubstrateNetwork.SubDAO && !redPacketContract) {
            setClaimState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setClaimState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const params = {
            redPacketId: id,
            password: Web3Utils.sha3(password)!,
            receiver: from,
        }
        if (network !== SubstrateNetwork.SubDAO) {
            return new Promise<void>(async (resolve, reject) => {
                const info = await Services.Polkadot.claimDotOrKsmRedPacket(params)
                if (info.errCode === 0 && info.data) {
                    setClaimState({
                        type: TransactionStateType.FINALIZED,
                    })
                    resolve()
                }
            })
        }

        return new Promise<void>(async (resolve, reject) => {
            const onSucceed = () => {
                setClaimState({
                    type: TransactionStateType.FINALIZED,
                })
                resolve()
            }
            const promiEvent = await Services.Polkadot.claimRedPacket(params)
            if (promiEvent === 'finalized') {
                onSucceed()
            }
        })
    }, [id, password, from, redPacketContract])

    const resetCallback = useCallback(() => {
        setClaimState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [claimState, claimCallback, resetCallback] as const
}
