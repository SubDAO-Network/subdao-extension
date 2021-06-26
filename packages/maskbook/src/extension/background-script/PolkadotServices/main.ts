import { ApiPromise, WsProvider } from '@polkadot/api'
import ConnectContract from '../../../polkadot/connect'
import { ws_server, mainAddress } from '../../../polkadot/constants'
import { ContractType } from '../../../polkadot/types'
import type { DaoInstanceDataMeta } from '../../../polkadot/types'
// import { getSigner, getNonce } from './sign'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import { initDaoContract } from './dao'
import { initBaseContract } from './base'
import { formatResult } from './helper'

let contract: ApiPromise | unknown = null
const value = 0
const gasLimit = -1

export async function getMainContract() {
    if (!contract) await initMainContract()

    if (!contract) {
        console.log('cannot connect main contract')
        return
    }

    return contract
}

export async function initMainContract() {
    if (contract) return contract

    const wsProvider = new WsProvider(ws_server)
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            Address: 'MultiAddress',
            LookupSource: 'MultiAddress',
        },
    })
    if (api.isConnected) {
        return (contract = await ConnectContract(api, ContractType.main, mainAddress.main))
    }
}

export async function fetchAllDaoInstance(address?: string): Promise<DaoInstanceDataMeta[]> {
    const contract = await getMainContract()
    const _address = address ?? currentSelectedWalletAddressSettings.value

    if (!contract || !_address) return [] as DaoInstanceDataMeta[]
    const res = await (contract as any)?.query?.listDaoInstances(_address, { value, gasLimit })
    const data = formatResult(res)
    return data as DaoInstanceDataMeta[]
}
