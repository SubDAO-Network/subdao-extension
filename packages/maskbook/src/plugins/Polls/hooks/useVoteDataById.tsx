import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { PollMetaData } from '../types'

export function useVoteDataById(voteAddress: string, voteId: string, hideVote?: boolean) {
    return useAsyncRetry(async () => {
        if (!voteId || hideVote) {
            return {}
        }
        return Services.Polkadot.queryOneVote(voteAddress, voteId)
    }, [hideVote])
}
