import { useCallback } from 'react'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import Services from '../../../extension/service'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { SubstrateNetwork } from '../../../polkadot/constants'

export function useRefundCallback(from: string, id?: string) {
    const [refundState, setRefundState] = useTransactionState()
    const { value: redPacketContract } = useSubRedPacketContract()

    const refundCallback = useCallback(async () => {
        if (!id) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const network = currentSubstrateNetworkSettings.value
        if (network === SubstrateNetwork.SubDAO && !redPacketContract) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setRefundState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        if (network !== SubstrateNetwork.SubDAO) {
            const params = {
                redPacketId: id,
                sender: from,
            }

            return new Promise<void>(async (resolve, reject) => {
                const info = await Services.Polkadot.refundDotOrKsmRedPacket(params)
                if (info.errCode === 0 && info.data) {
                    setRefundState({
                        type: TransactionStateType.FINALIZED,
                    })
                    resolve()
                }
            })
        }

        return new Promise<void>(async (resolve, reject) => {
            const onSucceed = () => {
                setRefundState({
                    type: TransactionStateType.FINALIZED,
                })
                resolve()
            }
            const promiEvent = await Services.Polkadot.refundRedPacket(id)
            console.log(`refund promiEvent...`, promiEvent)
            if (promiEvent === 'finalized') {
                onSucceed()
            }
        })
    }, [id, redPacketContract])

    const resetCallback = useCallback(() => {
        setRefundState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [refundState, refundCallback, resetCallback] as const
}
