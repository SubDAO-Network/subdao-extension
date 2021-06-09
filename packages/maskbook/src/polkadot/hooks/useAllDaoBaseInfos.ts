import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'
import type { DaoInstanceDataMeta, DaoAddresses, DaoBaseInfoDataMeta } from '../types'

// 1 + 2 + 4
enum LodingStaut {
    dao = 1,
    address = 1 + 2,
    base = 1 + 2 + 4,
}
let flag = 0

export interface useAllDaoBaseInfosData {
    daoInstances: DaoInstanceDataMeta[]
    daoAddresses: DaoAddresses[]
    daoBaseInfos: DaoBaseInfoDataMeta[]
}

export enum filterAddress {
    vote = 'vote_addr',
    base = 'base_addr',
    erc20 = 'erc20_addr',
    org = 'org',
}

export function useAllDaoBaseInfos() {
    const { value: daoInstances, loading: loadingDaoInstances } = useAsyncRetry(async () => {
        flag = 0
        flag = flag | LodingStaut.dao

        return Services.Polkadot.fetchAllDaoInstance()
    }, [])

    const { value: daoAddresses, loading: loadingDaoAddress } = useAsyncRetry(async () => {
        if (!daoInstances || !daoInstances.length) return

        flag = flag | LodingStaut.address
        return Services.Polkadot.fetchAllDaoAddress(daoInstances)
    }, [daoInstances])

    const { value: daoBaseInfos, loading: loadingBaseInfo } = useAsyncRetry(async () => {
        if (!daoAddresses || !daoAddresses.length) return

        flag = flag | LodingStaut.base
        return Services.Polkadot.fetchAllDaoBaseInfo(daoAddresses)
    }, [daoAddresses])

    const loading =
        (flag & LodingStaut.base) !== LodingStaut.base || loadingDaoInstances || loadingDaoAddress || loadingBaseInfo

    return {
        loading,
        value: {
            daoInstances: daoInstances || [],
            daoAddresses: daoAddresses || [],
            daoBaseInfos: daoBaseInfos || [],
        },
    }
}
