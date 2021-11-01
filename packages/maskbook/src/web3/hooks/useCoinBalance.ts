import { unreachable } from '../../utils/utils'
import { SubdaoTokenType } from '../types'
import { useSubERC20TokenBalance } from './useSubERC20TokenBalance'
import { useSubdaoTokenBalance } from './useSubdaoTokenBalance'
import { useAccount } from './useAccount'

export function useCoinBalance(type: SubdaoTokenType, address: string) {
    const account = useAccount()
    const r1 = useSubdaoTokenBalance(account)
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
