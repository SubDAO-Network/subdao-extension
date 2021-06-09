import { useState } from 'react'

export enum PolkadotTransactionStateType {
    UNKNOWN = 0,
    IS_IN_BLOCK,
    /** Confirmed */
    CONFIRMED,
    /** Fail to send */
    FAILED,
    /** Wait for external provider */
    WAIT_FOR_CONFIRMING,
    /** Receipt is available */
    RECEIPT,
    /** Reject by external provider */
    REJECTED,
    NO_WALLET,
}

export type PolkadotTransactionState = {
    type: PolkadotTransactionStateType
    error?: Error
    errorString?: string
}

export function useTransactionState() {
    return useState<PolkadotTransactionState>({
        type: PolkadotTransactionStateType.UNKNOWN,
    })
}
