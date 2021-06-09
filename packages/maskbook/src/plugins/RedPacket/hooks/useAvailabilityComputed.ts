import { compact } from 'lodash-es'
import { isSameAddress } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { resolveChainId } from '../../../web3/pipes'
import { ChainId } from '../../../web3/types'
import { RedPacketJSONPayload, RedPacketStatus } from '../types'
import { useAvailability } from './useAvailability'

/**
 * Fetch the red packet info from the chain
 * @param payload
 */
export function useAvailabilityComputed(account: string, payload: RedPacketJSONPayload) {
    const chainId = useChainId()
    const asyncResult = useAvailability(payload?.rpid)
    const { value: availability } = asyncResult

    if (!availability)
        return {
            ...asyncResult,
            payload,
            computed: {
                canClaim: false,
                canRefund: false,
                listOfStatus: [] as RedPacketStatus[],
            },
        }

    const { is_refund, claim_list, remaining_tokens, start_time, end_time, claimed_number, total_number } = JSON.parse(
        availability,
    )

    const balance = remaining_tokens.toString()
    const isEmpty = balance === '0'
    const isExpired = Date.now() > end_time
    const isClaimed = claim_list.filter((el: any) => el.includes(account)).length > 0
    const isRefunded = is_refund
    const isCreator = isSameAddress(payload?.sender.address ?? '', account)
    const parsedChainId = resolveChainId(payload.network ?? '') ?? ChainId.Mainnet

    return {
        ...asyncResult,
        value: { balance },
        computed: {
            canFetch: parsedChainId === chainId,
            canClaim: !isExpired && !isEmpty && !isClaimed && parsedChainId === chainId && payload.password,
            canRefund: isExpired && !isEmpty && isCreator && !isRefunded && parsedChainId === chainId,
            listOfStatus: compact([
                isClaimed ? RedPacketStatus.claimed : undefined,
                isEmpty ? RedPacketStatus.empty : undefined,
                isRefunded ? RedPacketStatus.refunded : undefined,
                isExpired ? RedPacketStatus.expired : undefined,
            ]),
        },
    }
}
