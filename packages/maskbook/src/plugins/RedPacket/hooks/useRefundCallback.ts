import { useCallback } from 'react'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'

import Services from '../../../extension/service'

export function useRefundCallback(from: string, id?: string) {
    const [refundState, setRefundState] = useTransactionState()
    const { value: redPacketContract } = useSubRedPacketContract()

    const refundCallback = useCallback(async () => {
        if (!redPacketContract || !id) {
            setRefundState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setRefundState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

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
