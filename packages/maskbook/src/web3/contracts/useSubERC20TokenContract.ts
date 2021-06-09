import { useAsyncRetry } from 'react-use'
import { useAccount } from '../hooks/useAccount'
import Services from '../../extension/service'

export function useSubERC20TokenContract(address: string) {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account || !address) return undefined
        return await Services.Polkadot.getERC20Contract(address)
    }, [account, address])
}
