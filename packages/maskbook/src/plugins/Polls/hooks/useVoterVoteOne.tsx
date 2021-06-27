import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { PollMetaData } from '../types'

export function useVoterVoteOne(voteAddress: string, voteId: string | undefined) {
    return useAsyncRetry(async () => {
        if (!voteAddress || !voteId) {
            return false
        }
        return Services.Polkadot.queryVoterVoteOne(voteAddress, voteId)
    }, [voteId])
}
