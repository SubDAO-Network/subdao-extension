import { unreachable } from '../../utils/utils'
import { PolkadotTokenType } from '../types'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { usePolkadotFreeBalance } from './usePolkadotFreeBalance'
import type { TokenDetailed } from '../types'
import type { ERC20TokenDetailed } from '../../web3/types'

export function useTokenBalance(type: PolkadotTokenType, address: string) {
    const r1 = usePolkadotFreeBalance(type === PolkadotTokenType.DOT ? address : '')
    const r2 = useERC20TokenBalance(type === PolkadotTokenType.ERC20 ? address : '')
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
