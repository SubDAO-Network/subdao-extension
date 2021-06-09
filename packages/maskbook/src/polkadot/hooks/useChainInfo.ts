import { useAsyncRetry } from 'react-use'
import { useSubstrate } from '../provider'

export function useChainInfo() {
    const { state, dispatch } = useSubstrate()
    const { api } = state
    return useAsyncRetry(async () => {
        if (!api || !api.isConnected) return []

        return api.registry.getChainProperties()
    }, [api])
}
