import { useAccount } from './useAccount'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'

/**
 * Fetch token balance from chain
 * @param token
 */
export function useSubdaoTokenBalance(address: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return await Services.Polkadot.getBalance(account)
    }, [account, address])
}
