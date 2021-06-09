import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import Services from '../../extension/service'

export function useSubERC20TokenBalance(address: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return await Services.Polkadot.getERC20Balance(address)
    }, [account, address])
}
