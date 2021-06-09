import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import Services from '../../extension/service'
import { useTrustedERC20TokensFromDB } from '../../plugins/Wallet/hooks/useERC20Token'

export function useERC20TokenBalance(address: string) {
    const ADDR: string = useAccount()
    return useAsyncRetry(async () => {
        if (!address || !ADDR) return ''

        return Services.Polkadot.fetchBalancesOfERC20(address)
    }, [ADDR, address])
}
