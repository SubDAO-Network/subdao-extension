import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'

export function useAllVotes(voteAddress: string) {
    return useAsyncRetry(async () => {
        return Services.Polkadot.queryAllVotes(voteAddress)
    }, [])
}
