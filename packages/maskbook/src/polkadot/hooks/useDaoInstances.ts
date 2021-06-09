import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'

export function useDaoInstances() {
    return useAsyncRetry(async () => {
        return Services.Polkadot.fetchAllDaoInstance()
    }, [])
}
