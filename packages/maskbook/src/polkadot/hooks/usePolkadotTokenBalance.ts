import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import { useSubstrate } from '../provider'
import type { State, TokenDetailedType } from '../types'
import { tokenDetail as token } from '../constants'
import { formatBalance } from '@polkadot/util'

export function usePolkadotTokenBalance() {
    const ADDR: string = useAccount()
    const { state } = useSubstrate()
    const { api } = state
    const {
        value: balanceAll,
        loading: polkadotTokenDetailedLoading,
        error: polkadotTokenDetailedError,
        retry: polkadotEtherTokenDetailed,
    } = useAsyncRetry(async () => {
        if (!ADDR || !api || !api.isConnected) return undefined

        return api?.derive?.balances?.all(ADDR)
    }, [api, ADDR])
    const data: TokenDetailedType = {
        balanceAll,
        token: {
            ...token,
        },
        address: ADDR,
    }

    return {
        value: data,
        loading: polkadotTokenDetailedLoading,
        error: polkadotTokenDetailedError,
        retry: polkadotEtherTokenDetailed,
    }
}
