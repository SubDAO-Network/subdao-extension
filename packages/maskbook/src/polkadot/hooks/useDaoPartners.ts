import { useMemo, useState, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service'
import { currentSelectedWalletAddressSettings } from '../../plugins/Wallet/settings'
import { some } from 'lodash-es'
import { WalletMessages } from '../../plugins/Wallet/messages'
import type { DaoAddresses, DaoInstanceDataMeta } from '../types'

// 1 + 2 + 4
enum LodingStaut {
    dao = 1,
    address = 1 + 2, // 3
    base = 1 + 2 + 4, // 7
    orgModerators = 1 + 2 + 4 + 8, // 15
    orgMembers = 1 + 2 + 4 + 8 + 16, //31
}
let flag = 0
export interface DaoInfo {
    address: string
    daoAddresses?: DaoAddresses | undefined
    name: string
    desc: string
    logo: string
}

interface DaoDataList {
    daoInstances: DaoInstanceDataMeta[]
    daoAddresses: DaoAddresses[]
    daoBaseInfos: DaoAddresses[]
    orgModerators: DaoAddresses[]
    orgMembers: DaoAddresses[]
    daoInfo: DaoInfo[]
}

interface DataCache {
    createTime?: number
    data: DaoDataList
}

const defaultCache = {
    createTime: 0,
    data: {
        daoInstances: [] as DaoInstanceDataMeta[],
        daoAddresses: [] as DaoAddresses[],
        daoBaseInfos: [] as DaoAddresses[],
        orgModerators: [] as DaoAddresses[],
        orgMembers: [] as DaoAddresses[],
        daoInfo: [] as DaoInfo[],
    },
} as DataCache

let dataCache: DataCache = defaultCache
const CACHE_TIME = 1000 * 60 * 60

const useCacheData = (): [boolean, DaoDataList | undefined, (data: DaoDataList) => void] => {
    const setCacheData = (data: DaoDataList) => {
        dataCache.createTime = Date.now()
        dataCache.data = data
    }
    if (!dataCache.createTime || !dataCache.data) return [false, undefined, setCacheData]

    if (Date.now() - dataCache.createTime - CACHE_TIME > 0) {
        dataCache = {} as DataCache
        return [false, undefined, setCacheData]
    }
    return [true, dataCache.data, setCacheData]
}

interface DaoPartnersResult {
    loading: boolean
    value: DaoDataList
}

export const useDaoPartners = (includeOrg?: boolean, onlyOrg: boolean = false): DaoPartnersResult => {
    const [hasCache, cacheData, setCacheData] = useCacheData()
    const _includeOrg = includeOrg ?? true
    const _address = currentSelectedWalletAddressSettings.value

    const { value: daoInstances, loading: loadingDaoInstances } = useAsyncRetry(async () => {
        if (hasCache) return

        flag = 0
        flag = flag | LodingStaut.dao

        return Services.Polkadot.fetchAllDaoInstance()
    }, [hasCache])

    const { value: daoAddresses, loading: loadingDaoAddress } = useAsyncRetry(async () => {
        if (hasCache) return

        if (!loadingDaoInstances) flag = flag | LodingStaut.address
        if (!daoInstances || !daoInstances.length) return
        return Services.Polkadot.fetchAllDaoAddress(daoInstances)
    }, [daoInstances, hasCache, loadingDaoInstances])

    const { value: daoBaseInfos, loading: loadingBaseInfo } = useAsyncRetry(async () => {
        if (hasCache) return

        if (!loadingDaoAddress) flag = flag | LodingStaut.base
        if (!daoAddresses || !daoAddresses.length) return
        return Services.Polkadot.fetchAllDaoBaseInfo(daoAddresses)
    }, [daoAddresses, hasCache, loadingDaoInstances])

    const { value: orgModerators, loading: loadingOrgModerators } = useAsyncRetry(async () => {
        if (hasCache) return

        if (!loadingDaoAddress) flag = flag | LodingStaut.orgModerators
        if (!_includeOrg || !daoAddresses || !daoAddresses.length) return
        return Services.Polkadot.fetchPartnerModeratorDao(daoAddresses)
    }, [daoAddresses, hasCache, loadingDaoInstances])
    const { value: orgMembers, loading: loadingOrgMembers } = useAsyncRetry(async () => {
        if (hasCache) return

        if (!loadingDaoAddress) flag = flag | LodingStaut.orgMembers
        if (!_includeOrg || !daoAddresses || !daoAddresses.length) return
        return Services.Polkadot.fetchPartnerMemberDao(daoAddresses)
    }, [daoAddresses, hasCache, loadingDaoInstances])

    const loadingBase =
        (flag & LodingStaut.base) !== LodingStaut.base || loadingDaoInstances || loadingDaoAddress || loadingBaseInfo
    const loadingModerators =
        (flag & LodingStaut.orgModerators) !== LodingStaut.orgModerators ||
        loadingDaoInstances ||
        loadingDaoAddress ||
        loadingOrgModerators
    const loadingMembers =
        (flag & LodingStaut.orgMembers) !== LodingStaut.orgMembers ||
        loadingDaoInstances ||
        loadingDaoAddress ||
        loadingOrgMembers
    const loadingPartner = !hasCache && (loadingBase || (_includeOrg && (loadingModerators || loadingMembers)))

    const value = useMemo(() => {
        if (hasCache) return cacheData as DaoDataList

        const dataResult = {
            daoInstances: daoInstances || ([] as DaoInstanceDataMeta[]),
            daoAddresses: daoAddresses || ([] as DaoAddresses[]),
            daoBaseInfos: daoBaseInfos || ([] as DaoAddresses[]),
            orgModerators: orgModerators || ([] as DaoAddresses[]),
            orgMembers: orgMembers || ([] as DaoAddresses[]),
            daoInfo: [] as DaoInfo[],
        } as DaoDataList

        if (!loadingBase && daoBaseInfos?.length) {
            let daos: DaoInfo[] = daoBaseInfos?.map((daoBaseInfo) => ({
                address: daoBaseInfo.address,
                daoAddresses: daoAddresses?.find((o) => o.base_addr === daoBaseInfo.address),
                name: daoBaseInfo.name,
                desc: daoBaseInfo.desc,
                logo: daoBaseInfo.logo,
            }))
            if (orgModerators?.length || orgMembers?.length) {
                daos = daos?.filter(
                    (o) =>
                        some(orgModerators, (m) => m.base_addr === o.address) ||
                        some(orgMembers, (m) => m.base_addr === o.address),
                )
            } else if (onlyOrg) {
                daos = []
            }
            dataResult.daoInfo = daos
            if (!loadingPartner) {
                setCacheData(dataResult)
            }
        }
        return dataResult
    }, [
        onlyOrg,
        loadingBase,
        loadingPartner,
        daoBaseInfos,
        daoAddresses,
        orgModerators,
        orgMembers,
        hasCache,
        cacheData,
        setCacheData,
        daoInstances,
    ])

    const resetCache = () => {
        console.log('resetCache')
        dataCache = defaultCache
    }

    useEffect(() => {
        console.log('set events')
        WalletMessages.events.walletsUpdated.on(resetCache)
        return () => {
            WalletMessages.events.walletsUpdated.off(resetCache)
        }
    }, [])
    return {
        loading: loadingPartner,
        value,
    }
}
