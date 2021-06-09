import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import Services from '../../extension/service'

export function useSubERC20TokenAllowance(address: string, spender?: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !address || !spender) return undefined
        return await Services.Polkadot.getERC20Allowance(address, spender)
    }, [account, address, spender])
}
