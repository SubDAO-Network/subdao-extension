import { useAsyncRetry } from 'react-use'

import { useAccount } from './useAccount'
import { useSubstrate } from '../provider'
import { networkNativeTokens } from '../constants'

export function usePolkadotTokenBalance() {
    const ADDR: string = useAccount()
    const { state } = useSubstrate()
    const api = state?.api
    const provider = state?.apiProvider
    const token = provider && networkNativeTokens[provider]

    const {
        value: balanceAll,
        loading: polkadotTokenDetailedLoading,
        error: polkadotTokenDetailedError,
        retry: polkadotEtherTokenDetailed,
    } = useAsyncRetry(async () => {
        if (!ADDR || !api || !api.isConnected || !token) return undefined
        return api?.derive?.balances?.all(ADDR)
    }, [api, ADDR, token])

    const data: any = {
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
