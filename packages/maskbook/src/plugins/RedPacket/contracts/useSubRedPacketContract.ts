import { useAsyncRetry } from 'react-use'
import { useAccount } from '../../../web3/hooks/useAccount'
import Services from '../../../extension/service'

export function useSubRedPacketContract() {
    const account = useAccount()
    return useAsyncRetry(async () => {
        if (!account) return undefined
        return await Services.Polkadot.getRedPacketContract()
    }, [account])
}
