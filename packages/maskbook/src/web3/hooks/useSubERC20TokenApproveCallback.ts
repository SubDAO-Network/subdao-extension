import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import { once } from 'lodash-es'
import type { TransactionReceipt } from 'web3-eth'
import { useSubERC20TokenContract } from '../contracts/useSubERC20TokenContract'
import { TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useSubERC20TokenAllowance } from './useSubERC20TokenAllowance'
import { useSubERC20TokenBalance } from './useSubERC20TokenBalance'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import Services from '../../extension/service'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveStateType {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    UPDATING,
    PENDING,
    APPROVED,
    FAILED,
}

export function useSubERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const account = useAccount()
    const { value: erc20Contract } = useSubERC20TokenContract(address)
    const [transactionState, setTransactionState] = useTransactionState()

    // read the approved information from the chain
    const {
        value: balance = '0',
        loading: loadingBalance,
        error: errorBalance,
        retry: revalidateBalance,
    } = useSubERC20TokenBalance(address)

    const {
        value: allowance = '0',
        loading: loadingAllowance,
        error: errorAllowance,
        retry: revalidateAllowance,
    } = useSubERC20TokenAllowance(address, spender)

    console.log(`allowance....`, allowance)
    // the computed approve state
    const approveStateType = useMemo(() => {
        if (!amount || !spender) return ApproveStateType.UNKNOWN
        if (loadingBalance || loadingAllowance) return ApproveStateType.UPDATING
        if (errorBalance || errorAllowance) return ApproveStateType.FAILED
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveStateType.INSUFFICIENT_BALANCE
        if (transactionState.type === TransactionStateType.WAIT_FOR_CONFIRMING) return ApproveStateType.PENDING
        return new BigNumber(allowance).isLessThan(amount) ? ApproveStateType.NOT_APPROVED : ApproveStateType.APPROVED
    }, [
        amount,
        spender,
        balance,
        allowance,
        errorBalance,
        errorAllowance,
        loadingAllowance,
        loadingBalance,
        transactionState.type,
    ])

    const approveCallback = useCallback(
        async (useExact: boolean = false) => {
            if (approveStateType === ApproveStateType.UNKNOWN || !amount || !spender || !erc20Contract) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Failed to approve token'),
                })
                return
            }

            // pre-step: start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            return new Promise<void>(async (resolve, reject) => {
                const promiEvent = await Services.Polkadot.approve(address, spender, amount)
                const revalidate = once(() => {
                    revalidateBalance()
                    revalidateAllowance()
                })
                console.log(`promiEvent...`, promiEvent)
                if (promiEvent === 'finalized') {
                    setTransactionState({
                        type: TransactionStateType.FINALIZED,
                    })
                    revalidate()
                    resolve()
                }
            })
        },
        [account, amount, balance, spender, loadingAllowance, loadingBalance, erc20Contract, approveStateType],
    )

    const resetCallback = useCallback(() => {
        revalidateBalance()
        revalidateAllowance()
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [revalidateBalance, revalidateAllowance])

    return [
        {
            type: approveStateType,
            allowance,
            amount,
            spender,
            balance,
        },
        transactionState,
        approveCallback,
        resetCallback,
    ] as const
}
