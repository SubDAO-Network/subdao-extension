import { unreachable } from '../../utils/utils'
import { PolkadotTokenType } from '../types'
import { useFormatERC20TokenBalance } from './useFormatERC20TokenBalance'
import { useFormatPolkadotFreeBalance } from './useFormatPolkadotFreeBalance'
import type { TokenDetailed } from '../types'
import type { ERC20TokenDetailed } from '../../web3/types'

export function useFormatTokenBalance(type: PolkadotTokenType, token: TokenDetailed) {
    const r1 = useFormatPolkadotFreeBalance(type === PolkadotTokenType.DOT ? token.address : '')
    const r2 = useFormatERC20TokenBalance(type === PolkadotTokenType.ERC20 ? token : null)
    const _type = type
    switch (_type) {
        case PolkadotTokenType.DOT:
            return r1
        case PolkadotTokenType.ERC20:
            return r2
        default:
            unreachable(_type)
    }
}
