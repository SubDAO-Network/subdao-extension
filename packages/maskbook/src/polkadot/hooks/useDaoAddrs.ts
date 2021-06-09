import { useAsyncRetry } from 'react-use'
import { useAccount } from './useAccount'
import type { DaoInstanceDataMeta } from '../types'
import Services from '../../extension/service'

export function useDaoAddrs(instances: DaoInstanceDataMeta[] | null) {
    return useAsyncRetry(async () => {
        if (!instances) return undefined

        return Services.Polkadot.fetchAllDaoAddress(instances)
    }, [instances])
}
