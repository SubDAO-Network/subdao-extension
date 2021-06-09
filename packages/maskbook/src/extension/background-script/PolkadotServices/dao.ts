import ConnectContract from '../../../polkadot/connect'
import { ws_server, mainAddress } from '../../../polkadot/constants'
import { ContractType, DaoAddresses } from '../../../polkadot/types'
import { getSigner, getNonce } from './sign'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { getApi } from './base'
import type { PollMetaData, VoteData, VoteChoiseData } from '../../../plugins/Polls/types'
import type { DaoInstanceDataMeta } from '../../../polkadot/types'
import { formatResult } from './helper'

const value = 0
const gasLimit = -1

export async function getDaoContract(address: string) {
    return initDaoContract(address)
}

export async function initDaoContract(address: string) {
    const api = await getApi()
    return await ConnectContract(api, ContractType.dao, address)
}

export async function fetchDaoAddrs(address: string): Promise<DaoAddresses> {
    const _address = currentSelectedWalletAddressSettings.value
    const contract = await getDaoContract(address)
    if (!contract) {
        return {} as DaoAddresses
    }

    const result = await contract.query.queryComponentAddrs(_address, { value, gasLimit })
    const data: DaoAddresses = formatResult(result)
    return {
        dao_address: address,
        ...data,
    }
}

export async function fetchAllDaoAddress(daoInstances: DaoInstanceDataMeta[]): Promise<DaoAddresses[]> {
    if (!daoInstances || !daoInstances.length) {
        return [] as DaoAddresses[]
    }

    return await Promise.all(
        daoInstances.filter((x) => x.dao_manager_addr).map((item) => fetchDaoAddrs(item.dao_manager_addr)),
    )
}
