import { useCallback } from 'react'
import { Keyring } from '@polkadot/api'
import { BN_HUNDRED } from '@polkadot/util'
import { PolkadotTransactionStateType as StateType, useTransactionState } from './useTransactionState'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { isValidAddress } from '../../plugins/Wallet/services/formatter'
import { keypairType } from '../constants'
import { useSubstrate } from '../provider'
import { formatAmount } from '../utils/format'
import { ActionType, PolkadotTokenType } from '../types'
import ConnectContract from '../connect'
import { ContractType, TokenDetailed } from '../types'

export function useTransferTokenCallback(type: PolkadotTokenType = PolkadotTokenType.DOT, token: TokenDetailed) {
    const account = useWallet()
    const { state, dispatch } = useSubstrate()
    const api = state?.api
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(
        async (_amount: string, recipient: string) => {
            let [amount, isValid] = formatAmount(_amount, token)
            const keyring = new Keyring({ type: keypairType })
            if (!api || !isValid || !amount || !dispatch) {
                setTransferState({
                    type: StateType.UNKNOWN,
                })
                return
            }
            if (!account) {
                setTransferState({
                    type: StateType.NO_WALLET,
                })
                return
            }

            if (!api.isConnected) {
                setTransferState({
                    type: StateType.FAILED,
                    error: new Error(`Cann't connect api`),
                })
                return
            }

            if (!isValidAddress(recipient)) {
                setTransferState({
                    type: StateType.FAILED,
                    error: new Error('Invalid recipient address'),
                })
                return
            }

            let seed: string
            if (account?.mnemonic?.length > 0) {
                seed = account?.mnemonic?.join(' ')
            } else if (account?._private_key_) {
                seed = account?._private_key_
            } else {
                return setTransferState({
                    type: StateType.NO_WALLET,
                })
            }
            dispatch({
                type: ActionType.SET_TRANSFER_STATE,
                payload: {
                    type: StateType.WAIT_FOR_CONFIRMING,
                },
            })

            if (type === PolkadotTokenType.DOT) {
                const balanceAll = await api?.derive?.balances?.all(account?.address)
                console.log(`availableBalance: ${(balanceAll as any).availableBalance}`)
                console.log(`Transaction _amount: ${_amount}`)
                const availableBalance = (balanceAll as any).availableBalance
                if (availableBalance.eq(amount)) {
                    try {
                        const { partialFee } = await api.tx.balances
                            .transfer(recipient, availableBalance)
                            .paymentInfo(account?.address)
                        const adjFee = partialFee.muln(110).div(BN_HUNDRED)
                        amount = amount.sub(adjFee)
                    } catch (error: any) {
                        console.error((error as Error).message)
                        setTransferState({
                            type: StateType.FAILED,
                            error,
                        })
                        return
                    }
                }
            }
            setTransferState({
                type: StateType.WAIT_FOR_CONFIRMING,
            })
            console.log(`Transaction amount: ${amount}`)
            const signSender = keyring.addFromUri(seed)
            if (type === PolkadotTokenType.DOT) {
                const unsub = await api.tx.balances
                    .transfer(recipient, amount)
                    .signAndSend(signSender, (result: any) => {
                        console.log(`Current status is ${result.status}`)
                        if (result.status.isInBlock) {
                            console.log(`Transaction included at blockHash ${result.status.asInBlock}`)
                            dispatch({
                                type: ActionType.SET_TRANSFER_STATE,
                                payload: {
                                    type: StateType.IS_IN_BLOCK,
                                },
                            })
                        } else if (result.status.isFinalized) {
                            dispatch({
                                type: ActionType.SET_TRANSFER_STATE,
                                payload: {
                                    type: StateType.CONFIRMED,
                                },
                            })
                            console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`)
                            unsub()
                        }
                    })
            } else {
                const contract = await ConnectContract(api, ContractType.erc20, token.address)
                const { nonce }: any = await api?.query?.system.account(account.address)
                const unsub = await (contract as any).tx
                    .transfer({ value: 0, gasLimit: -1 }, recipient, _amount)
                    .signAndSend(signSender, { nonce }, (result: any) => {
                        console.log(`Current status is ${result.status}`)
                        if (result.status.isInBlock) {
                            console.log(`Transaction included at blockHash ${result.status.asInBlock}`)
                            dispatch({
                                type: ActionType.SET_TRANSFER_STATE,
                                payload: {
                                    type: StateType.IS_IN_BLOCK,
                                },
                            })
                        } else if (result.status.isFinalized) {
                            dispatch({
                                type: ActionType.SET_TRANSFER_STATE,
                                payload: {
                                    type: StateType.CONFIRMED,
                                },
                            })
                            console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`)
                            unsub()
                        }
                    })
            }
        },
        [api, account, setTransferState, dispatch, type, token],
    )

    const resetCallback = useCallback(() => {
        setTransferState({
            type: StateType.UNKNOWN,
        })
    }, [setTransferState])

    return [transferState, transferCallback, resetCallback] as const
}
