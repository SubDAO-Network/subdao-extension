import { useMemo } from 'react'
import { SubstrateNetworkWsProvider } from '../constants'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSubstrateNetworkSettings } from '../../settings/settings'

export function useSubstrateNetworkProvider() {
    const network = useValueRef(currentSubstrateNetworkSettings)
    const wsProvider = SubstrateNetworkWsProvider[network]
    return useMemo(() => wsProvider, [wsProvider])
}
