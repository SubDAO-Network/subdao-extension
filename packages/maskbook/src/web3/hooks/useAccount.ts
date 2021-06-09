import { useWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const selectedWallet = useWallet()
    return selectedWallet?.address ?? ''
}
