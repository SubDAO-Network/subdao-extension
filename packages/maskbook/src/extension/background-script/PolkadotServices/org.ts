import ConnectContract from '../../../polkadot/connect'
import { ContractType } from '../../../polkadot/types'
import { getSigner, getNonce } from './sign'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { getApi } from './base'
import { formatResult } from './helper'
import type { DaoAddresses } from '../../../polkadot/types'
import { some } from 'lodash-es'

const value = 0
const gasLimit = -1

export const getOrgContract = async (address: string) => {
    return initOrgContract(address)
}

export const initOrgContract = async (address: string) => {
    const api = await getApi()
    return await ConnectContract(api, ContractType.org, address)
}

export const fetchDaoModeratorList = async (orgAddress: string) => {
    const orgContract = await getOrgContract(orgAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!orgContract || !_address) return

    const data = await (orgContract as any)?.query?.getDaoModeratorDetailList(_address, { value, gasLimit })
    return formatResult(data)
}

export const isModerator = async (orgAddress: string) => {
    const orgContract = await getOrgContract(orgAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!orgContract || !_address) return false

    const list = await fetchDaoModeratorList(orgAddress)
    return some(list, m => m.includes(_address))
}

export const fetchDaoMemberList = async (orgAddress: string) => {
    const orgContract = await getOrgContract(orgAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!orgContract || !_address) return

    const data = await (orgContract as any)?.query?.getDaoMemberDetailList(_address, { value, gasLimit })
    return formatResult(data)
}

export const isMember = async (orgAddress: string) => {
    const orgContract = await getOrgContract(orgAddress)
    const _address = currentSelectedWalletAddressSettings.value

    if (!orgContract || !_address) return false

    const members = await fetchDaoMemberList(orgAddress)
    return some(members, m => m.includes(_address))
}

export const fetchAllDaoModeratorList = async (list: DaoAddresses[]) => {
    if (!list || !list.length) {
        return []
    }

    return await Promise.all(
        list.filter((x) => Boolean(x.org_addr)).map((item) => fetchDaoModeratorList(item.org_addr)),
    )
}

export const fetchAllDaoMemberList = async (list: DaoAddresses[]) => {
    if (!list || !list.length) {
        return []
    }

    return await Promise.all(
        list.filter((x) => Boolean(x.org_addr)).map((item) => fetchDaoMemberList(item.org_addr)),
    )
}

export const fetchPartnerModeratorDao = async (list: DaoAddresses[]): Promise<DaoAddresses[]> => {
    if (!list || !list.length) {
        return [] as DaoAddresses[]
    }

    const result = [] as DaoAddresses[]
    const orgAddrs = list.filter((x) => Boolean(x.org_addr))
    const isMemberArr = await Promise.all(orgAddrs.map((item) => isModerator(item.org_addr)))
    isMemberArr.forEach((isMemberArr, index) => {
        if (isMemberArr) {
            result.push(orgAddrs[index])
        }
    })

    return result
}

export const fetchPartnerMemberDao = async (list: DaoAddresses[]): Promise<DaoAddresses[]> => {
    if (!list || !list.length) {
        return [] as DaoAddresses[]
    }

    const result = [] as DaoAddresses[]
    const orgAddrs = list.filter((x) => Boolean(x.org_addr))
    const isMemberArr = await Promise.all(orgAddrs.map((item) => isMember(item.org_addr)))
    isMemberArr.forEach((isMemberArr, index) => {
        if (isMemberArr) {
            result.push(orgAddrs[index])
        }
    })

    return result
}
