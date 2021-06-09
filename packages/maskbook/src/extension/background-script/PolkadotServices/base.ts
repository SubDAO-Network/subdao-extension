import { ApiPromise, WsProvider } from '@polkadot/api'
import ConnectContract from '../../../polkadot/connect'
import { ws_server, mainAddress } from '../../../polkadot/constants'
import { ContractType } from '../../../polkadot/types'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { formatResult } from './helper'
import type { DaoAddresses } from '../../../polkadot/types'

const value = 0
const gasLimit = -1
const ContractCache = new Map<string, any>()

let API: ApiPromise | undefined

export async function getApi(): Promise<ApiPromise> {
    if (!API) await initApi()

    return API || ({} as ApiPromise)
}

export async function initApi() {
    if (API) return API

    const wsProvider = new WsProvider(ws_server)
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            Address: 'AccountId',
            LookupSource: 'AccountId',
        },
    })
    if (api.isConnected) {
        API = api
    }
    return API
}

export async function getBaseContract(address: string) {
    return await initBaseContract(address)
}

export async function initBaseContract(address: string) {
    const api = await getApi()
    return await ConnectContract(api, ContractType.base, address)
}

export async function fetchBaseInfo(address: string) {
    const contract = await getBaseContract(address)
    const _address = currentSelectedWalletAddressSettings.value

    if (!contract || !address) return
    const res = await (contract as any)?.query?.getBase(_address, { value, gasLimit })
    return {
        address,
        ...formatResult(res),
    }
}

export async function fetchAllDaoBaseInfo(list: DaoAddresses[]) {
    if (!list || !list.length) {
        return []
    }

    return await Promise.all(list.filter((x) => Boolean(x.base_addr)).map((item) => fetchBaseInfo(item.base_addr)))
}
