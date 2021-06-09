export interface PollMetaData {
    question: string
    key: string
    start_time: number
    end_time: number
    options: string[]
    results: number[]
    desc?: string
    support_require_num?: number
    min_require_num?: number
    sender?: string
    vote_id?: string
    id?: string
    vote_address: string
}

export enum PollStatus {
    Inactive = 'Inactive',
    Voted = 'Voted',
    Voting = 'Voting',
    Closed = 'Closed',
}

export interface VoteData {
    vote_id?: string | undefined
    title: string
    desc?: string
    vote_time: string
    start_date?: string
    support_require_num: number
    min_require_num: number
    choices: string
    vote_address: string
}

export interface VoteChoiseData {
    voteId: string
    choiseId: string
    vote_address: string
}

export interface OptionItem {
    name: string
    vote_number: number
}

export interface VoteOption {
    options: OptionItem[]
    total_number: number
}
