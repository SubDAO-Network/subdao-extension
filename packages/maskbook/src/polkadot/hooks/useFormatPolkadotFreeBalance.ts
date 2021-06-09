import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import Services from '../../extension/service'

export function useFormatPolkadotFreeBalance(address: string) {
    const ADDR: string = useAccount()
    return useAsyncRetry(async () => {
        if (!ADDR || !address) return undefined

        return Services.Polkadot.getFormatFreeBalances(ADDR)
    }, [ADDR, address])
}
