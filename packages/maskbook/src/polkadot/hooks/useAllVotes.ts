import { useAsyncRetry } from 'react-use'
import type { VoteOption } from '../../plugins/Polls/types'
import Services from '../../extension/service'

export interface VotingData {
    vote_id: string
    title: string
    choices: string
    desc: string
    executed: boolean
    min_require_num: number
    support_require_num: number
    start_date: Date
    vote_time: number
    vote_items: VoteOption
}

export function useAllVotes(voteAddress: string) {
    return useAsyncRetry(async () => {
        if (!voteAddress) return [] as VotingData[]
        return Services.Polkadot.queryAllVotes(voteAddress)
    }, [voteAddress])
}
