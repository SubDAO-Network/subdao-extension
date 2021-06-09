import { useAsyncRetry } from 'react-use'
import type { EtherTokenDetailed } from '../types'
import { tokenDetail } from '../../polkadot/constants'

export function useSubDAOTokenDetailed() {
    return useAsyncRetry(async () => {
        return tokenDetail ?? ({} as EtherTokenDetailed)
    }, [tokenDetail])
}
