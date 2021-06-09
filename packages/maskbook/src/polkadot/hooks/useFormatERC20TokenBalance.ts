import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import Services from '../../extension/service'
import type { TokenDetailed } from '../types'

export function useFormatERC20TokenBalance(token: TokenDetailed | null) {
    const ADDR: string = useAccount()
    return useAsyncRetry(async () => {
        if (!ADDR || !token) return undefined

        return Services.Polkadot.fetchFormatBalancesOfERC20(token)
    }, [ADDR, token])
}
