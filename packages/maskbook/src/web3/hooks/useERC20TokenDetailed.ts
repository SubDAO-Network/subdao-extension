import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { EthereumTokenType, ERC20TokenDetailed } from '../types'
import Services from '../../extension/service'

export function useERC20TokenDetailed(address: string, token?: Partial<ERC20TokenDetailed>) {
    const { value: tokenDetail, ...asyncResult } = useAsyncRetry(async () => {
        if (!address) return

        return Services.Polkadot.fetchERC20Info(address)
    }, [address])

    // compose
    const _token = useMemo(() => {
        if (!address || !tokenDetail) return

        return {
            ...tokenDetail,
            type: EthereumTokenType.ERC20,
            address: tokenDetail?.address,
            name: tokenDetail?.name ?? token?.name ?? '',
            symbol: tokenDetail?.symbol ?? token?.symbol ?? '',
            decimals: tokenDetail?.decimals ?? token?.decimals,
        } as ERC20TokenDetailed
    }, [tokenDetail, address, token])

    return {
        ...asyncResult,
        value: _token,
    } as AsyncStateRetry<typeof _token>
}
