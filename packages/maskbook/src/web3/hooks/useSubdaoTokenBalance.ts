import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'

export function useSubdaoTokenBalance(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return undefined
        return await Services.Polkadot.getBalance(address)
    }, [address])
}
