import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import Fuse from 'fuse.js'
import Services from '../../extension/service'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { isSameAddress } from '../../web3/helpers'
import { useChainId } from '../../web3/hooks/useBlockNumber'
import { SubdaoTokenType } from '../../web3/types'
import { useERC20TokenDetailed } from '../../web3/hooks/useERC20TokenDetailed'
import type { DaoInstanceDataMeta, DaoAddresses } from '../types'
import type { ERC20TokenDetailed } from '../../web3/types'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}

export function useERC20TokensDetailedFromTokenLists(lists: string[], keyword: string = '') {
    //#region fetch token lists
    const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
        async () => (lists.length === 0 ? [] : Services.Polkadot.fetchERC20TokensFromTokenLists(lists)),
        [lists.sort().join()],
    )
    //#endregion

    //#region fuse
    const fuse = useMemo(
        () =>
            new Fuse(allTokens, {
                shouldSort: true,
                threshold: 0.45,
                minMatchCharLength: 1,
                keys: [
                    { name: 'name', weight: 0.5 },
                    { name: 'symbol', weight: 0.5 },
                ],
            }),
        [allTokens],
    )
    //#endregion

    //#region create searched tokens
    const searchedTokens = useMemo(() => {
        if (!keyword) return allTokens
        return [
            ...allTokens.filter((token) => isSameAddress(token.address, keyword)),
            ...fuse.search(keyword).map((x) => x.item),
        ]
    }, [keyword, fuse, allTokens])
    //#endregion

    //#region add token by address
    const matchedToken = useMemo(() => {
        if (!keyword || searchedTokens.length) return
        return {
            type: SubdaoTokenType.ERC20,
            address: keyword,
        }
    }, [keyword, searchedTokens.length])
    const { value: searchedToken, loading: loadingSearchedToken } = useERC20TokenDetailed(matchedToken?.address ?? '')
    //#endregion

    const loading = loadingAllTokens

    return {
        state: loading
            ? TokenListsState.LOADING_TOKEN_LISTS
            : loadingSearchedToken
            ? TokenListsState.LOADING_SEARCHED_TOKEN
            : TokenListsState.READY,
        tokensDetailed: searchedTokens.length ? searchedTokens : searchedToken ? [searchedToken] : [],
    }
}
