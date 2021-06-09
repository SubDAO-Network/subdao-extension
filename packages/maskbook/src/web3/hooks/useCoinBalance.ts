import { unreachable } from '../../utils/utils'
import { SubdaoTokenType } from '../types'
import { useSubERC20TokenBalance } from './useSubERC20TokenBalance'
import { useSubdaoTokenBalance } from './useSubdaoTokenBalance'

export function useCoinBalance(type: SubdaoTokenType, address: string) {
    const r1 = useSubdaoTokenBalance(type === SubdaoTokenType.SubDAO ? address : '')
    const r2 = useSubERC20TokenBalance(type === SubdaoTokenType.ERC20 ? address : '')
    const type_ = type
    switch (type_) {
        case SubdaoTokenType.SubDAO:
            return r1
        case SubdaoTokenType.ERC20:
            return r2
        default:
            unreachable(type_)
    }
}
