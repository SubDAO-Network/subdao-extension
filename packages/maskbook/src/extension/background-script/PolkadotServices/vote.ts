import { ApiPromise, WsProvider } from '@polkadot/api'
import ConnectContract from '../../../polkadot/connect'
import { ws_server, voteAddress } from '../../../polkadot/constants'
import { ContractType } from '../../../polkadot/types'
import { getSigner, getNonce } from './sign'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import type { PollMetaData, VoteData, VoteChoiseData } from '../../../plugins/Polls/types'
import { formatChoices } from '../../../plugins/Polls/formatter'
import { u8aToHex } from '@polkadot/util'
import { formatResult } from './helper'
import { getApi } from './base'
import { findLast } from 'lodash-es'

const value = 0
const gasLimit = -1

export const getVoteContract = async (address: string) => {
    return initVoteContract(address)
}

export async function initVoteContract(address: string) {
    const api = await getApi()
    return ConnectContract(api, ContractType.vote, address)
}

export const newVote = async (obj: VoteData) => {
    return new Promise(async (resolve, reject) => {
        const { vote_address } = obj
        const voteContract = await getVoteContract(vote_address || '')
        const address = currentSelectedWalletAddressSettings.value
        const { title, desc, vote_time, support_require_num, min_require_num, choices } = obj

        if (!address) {
            reject('cannot get wallet address')
        }
        if (!voteContract) {
            reject('cannot get vote contract')
        }
        const signer = await getSigner()
        const nonce = await getNonce()
        await (voteContract as any)?.tx
            .newVote({ value, gasLimit }, title, desc, vote_time, support_require_num, min_require_num, choices)
            .signAndSend(signer, { nonce }, (res: any) => {
                if (res?.status?.isInBlock) {
                    resolve(res)
                }
            })
    })
}

export const findVote = async (poll: PollMetaData, isClosed: boolean) => {
    const { vote_address, vote_id } = poll
    if (vote_id) {
        return queryOneVote(vote_id, vote_address)
    }
    const votes = !isClosed ? await queryAllVotes(vote_address || '') : await queryWaitVote(vote_address || '')
    if (!votes || !votes.length) {
        return null
    }

    // a:0|b:0|c:0
    const choicesReg = new RegExp(`^${poll.options.join('\\:\\d+\\|')}\\:\\d+`)

    // find last by vote
    return findLast(
        votes,
        (o) =>
            o.title === poll.question &&
            Number(o.vote_time.replace(/,/g, '')) === poll.end_time - poll.start_time &&
            Number(o.start_date.replace(/,/g, '')) - poll.start_time < 1000 * 60 * 5,
        //  choicesReg.test(o.choices),
    )
}

interface VoteResult {
    choices: string
    desc: string
    executed: false
    min_require_num: string
    start_date: string
    support_num: string
    support_require_num: string
    title: string
    vote_id: string
    vote_time: string
}

export const queryAllVotes = async (voteAddress: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value
    if (!voteContract || !_address) return []

    const data = await (voteContract as any)?.query?.queryAllVote(_address, { value, gasLimit }, 0, 10000)
    let result = formatResult(data)

    return result.data?.map?.((vote: VoteResult) => {
        return {
            ...vote,
            min_require_num: Number(vote.min_require_num),
            support_require_num: Number(vote.support_require_num),
            start_date: new Date(Number(vote.start_date.replace(/,/g, ''))),
            vote_time: Number(vote.vote_time.replace(/,/g, '')),
            vote_items: formatChoices(vote.choices),
        }
    })
}

export const queryOneVote = async (id: string, voteAddress: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!voteContract || !_address) return

    const data = await (voteContract as any)?.query?.queryOneVote(_address, { value, gasLimit }, id)
    return formatResult(data)
}

const queryWaitVote = async (voteAddress: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!voteContract || !_address) return

    const data = await (voteContract as any)?.query?.queryPendingVote(_address, { value, gasLimit })
    return formatResult(data)
}

const queryOpenVote = async (voteAddress: string, voteId: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!voteContract || !_address) return

    const data = await (voteContract as any)?.query?.queryActiveVote(_address, { value, gasLimit }, voteId)
    return formatResult(data)
}

export const queryVoterVoteOne = async (voteAddress: string, voteId: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!voteContract || !_address) return

    const data = await (voteContract as any)?.query?.queryVoterVoteOne(_address, { value, gasLimit }, voteId, _address)
    const formattedResult = formatResult(data)
    return typeof formattedResult.isTrue === 'boolean' ? formattedResult.isTrue : formattedResult
}

const queryExecutedVote = async (voteAddress: string) => {
    const voteContract = await getVoteContract(voteAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!voteContract || !_address) return

    const data = await (voteContract as any)?.query?.queryExecutedVote(_address, { value, gasLimit })
    return formatResult(data)
}

export const executeVote = async (voteAddress: string, id: string) => {
    return new Promise(async (resolve, reject) => {
        const voteContract = await getVoteContract(voteAddress)
        const address = currentSelectedWalletAddressSettings.value
        if (!id) {
            console.log('cannot get vote_id')
            return reject(false)
        }
        if (!address) {
            console.log('cannot get wallet address')
            return reject(false)
        }
        if (!voteContract) {
            console.log('cannot get vote contract')
            return reject(false)
        }
        const signer = await getSigner()
        const nonce = await getNonce()

        await (voteContract as any)
            .exec('execute', { value, gasLimit }, id)
            .signAndSend(signer, { nonce }, (result: any) => {
                if (result.status?.isFinalized) {
                    resolve(true)
                }
            })
    })
}

export const voteChoice = async (obj: VoteChoiseData) => {
    return new Promise(async (resolve, reject) => {
        const { voteId, choiseId, vote_address } = obj
        const voteContract = await getVoteContract(vote_address)
        const address = currentSelectedWalletAddressSettings.value
        if (!address) {
            console.log('cannot get wallet address')
            return reject(false)
        }
        if (!voteContract) {
            console.log('cannot get vote contract')
            return reject(false)
        }
        const signer = await getSigner()
        const nonce = await getNonce()
        await (voteContract as any).tx
            .vote({ value, gasLimit }, voteId, choiseId, address)
            .signAndSend(signer, { nonce }, (res: any) => {
                if (res?.status?.isFinalized) {
                    resolve(res)
                }
            })
    })
}
