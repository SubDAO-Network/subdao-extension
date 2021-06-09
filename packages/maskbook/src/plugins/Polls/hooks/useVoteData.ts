import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { PollMetaData } from '../types'

export function useVoteData(poll: PollMetaData, isClosed: boolean, hideVote?: boolean) {
    return useAsyncRetry(async () => {
        if (hideVote) {
            return {}
        }
        return Services.Polkadot.findVote(poll, isClosed)
    }, [isClosed, hideVote])
}
