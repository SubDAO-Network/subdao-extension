import { useMemo } from 'react'
// import Fuse from 'fuse.js'
import Services from '../../extension/service'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { isSameAddress } from '../helpers'
import { useChainId } from './useBlockNumber'
import { EthereumTokenType } from '../types'
import { useERC20TokenDetailed } from './useERC20TokenDetailed'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}

export function useERC20TokensDetailedFromTokenLists(lists: string[], keyword: string = '') {
    //#region fetch token lists
    const chainId = useChainId()
    // const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
    //     async () => (lists.length === 0 ? [] : Services.Ethereum.fetchERC20TokensFromTokenLists(lists, chainId)),
    //     [chainId, lists.sort().join()],
    // )

    const allTokens = [
        {
            address: '5HS33aRib3zndQKTe22nnfqsjE4QCBYa8jTioxNU3ExqUHkT',
            chainId: 1,
            decimals: 1,
            name: '8FirstTestToken',
            symbol: 'fFTT',
            type: 1,
        },
    ]
    //#endregion

    //#region create searched tokens
    const searchedTokens = useMemo(() => {
        if (!keyword) return allTokens
        return [
            ...(EthereumAddress.isValid(keyword)
                ? allTokens.filter((token) => isSameAddress(token.address, keyword))
                : []),
        ]
    }, [keyword, allTokens])
    //#endregion

    //#region add token by address
    const matchedToken = useMemo(() => {
        if (!keyword || !EthereumAddress.isValid(keyword) || searchedTokens.length) return
        return {
            type: EthereumTokenType.ERC20,
            address: keyword,
        }
    }, [keyword, searchedTokens.length])
    // const { value: searchedToken, loading: loadingSearchedToken } = useERC20TokenDetailed(matchedToken?.address ?? '')
    //#endregion

    // return {
    //     state: loadingAllTokens
    //         ? TokenListsState.LOADING_TOKEN_LISTS
    //         : loadingSearchedToken
    //         ? TokenListsState.LOADING_SEARCHED_TOKEN
    //         : TokenListsState.READY,
    //     tokensDetailed: searchedTokens.length ? searchedTokens : searchedToken ? [searchedToken] : [],
    // }

    return {
        state: TokenListsState.READY,
        tokensDetailed: searchedTokens.length ? searchedTokens : [],
    }
}
