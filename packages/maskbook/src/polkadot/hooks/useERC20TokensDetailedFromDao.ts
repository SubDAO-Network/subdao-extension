import { useMemo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import Fuse from 'fuse.js'
import Services from '../../extension/service'
import { useAsync } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { isSameAddress } from '../../web3/helpers'
import { useChainId } from '../../web3/hooks/useBlockNumber'
import { EthereumTokenType } from '../../web3/types'
import { useERC20TokenDetailed } from '../../web3/hooks/useERC20TokenDetailed'
import type { DaoInstanceDataMeta, DaoAddresses } from '../types'
import type { ERC20TokenDetailed } from '../../web3/types'

export enum TokenListsState {
    READY,
    LOADING_TOKEN_LISTS,
    LOADING_SEARCHED_TOKEN,
}
// 1 + 2 + 4
enum LodingStaut {
    dao = 1,
    address = 1 + 2,
    token = 1 + 2 + 4,
}
let flag = 0

export function useERC20TokensDetailedFromDao(keyword: string = '') {
    const { value: daoInstances, loading: loadingDaoInstances } = useAsyncRetry(async () => {
        flag = 0
        flag = flag | LodingStaut.dao

        return Services.Polkadot.fetchAllDaoInstance()
    }, [])

    const { value: daoAddresses, loading: loadingDaoAddress } = useAsyncRetry(async () => {
        if (!loadingDaoInstances) flag = flag | LodingStaut.address
        if (!daoInstances || !daoInstances.length) return

        return Services.Polkadot.fetchAllDaoAddress(daoInstances)
    }, [daoInstances, loadingDaoInstances])

    const { value: allTokens = [], loading: loadingAllTokens } = useAsyncRetry(async () => {
        if (!loadingDaoInstances) flag = flag | LodingStaut.token
        if (!daoAddresses || !daoAddresses.length) return

        return Services.Polkadot.fetchAllERC20Infos(daoAddresses)
    }, [daoAddresses, loadingDaoInstances])

    //#region fetch token lists
    // const chainId = useChainId()
    // const { value: allTokens = [], loading: loadingAllTokens } = useAsync(
    //     async () => (lists.length === 0 ? [] : Services.Ethereum.fetchERC20TokensFromTokenLists(lists, chainId)),
    //     [chainId, lists.sort().join()],
    // )
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
            type: EthereumTokenType.ERC20,
            address: keyword,
        }
    }, [keyword, searchedTokens.length])
    const { value: searchedToken, loading: loadingSearchedToken } = useERC20TokenDetailed(matchedToken?.address ?? '')
    //#endregion

    const loading =
        (flag & LodingStaut.token) !== LodingStaut.token || loadingDaoInstances || loadingDaoAddress || loadingAllTokens
    // console.log('---allToken', allTokens, loading)
    console.log(`flag: ${flag}`)
    console.log(
        `loading: ${loading}, loadingDaoInstances: ${loadingDaoInstances}, loadingDaoAddress: ${loadingDaoAddress}, loadingAllTokens: ${loadingAllTokens}`,
    )

    return {
        state: loading
            ? TokenListsState.LOADING_TOKEN_LISTS
            : loadingSearchedToken
            ? TokenListsState.LOADING_SEARCHED_TOKEN
            : TokenListsState.READY,
        tokensDetailed: searchedTokens.length ? searchedTokens : searchedToken ? [searchedToken] : [],
    }
}
