import type { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import mainAbi from './abis/main_v0.1.json'
import baseAbi from './abis/base_v0.1.json'
import erc20Abi from './abis/erc20_v0.1.json'
import redPacketAbi from './abis/redpacket_v0.1.json'
import orgAbi from './abis/org_v0.1.json'
import vaultAbi from './abis/vault_v0.1.json'
import voteAbi from './abis/vote_manager_v0.1.json'
import daoManagerAbi from './abis/dao_manager_v0.1.json'
import { ContractType } from './types'
import { unreachable } from '../utils/utils'

const ConnectContract = async (api: ApiPromise, type: ContractType, address: string) => {
    if (!api) {
        return
    }

    let abi
    switch (type) {
        case ContractType.base:
            abi = baseAbi
            break
        case ContractType.erc20:
            abi = erc20Abi
            break
        case ContractType.redPacket:
            abi = redPacketAbi
            break
        case ContractType.org:
            abi = orgAbi
            break
        case ContractType.vault:
            abi = vaultAbi
            break
        case ContractType.vote:
            abi = voteAbi
            break
        case ContractType.dao:
            abi = daoManagerAbi
            break
        case ContractType.main:
            abi = mainAbi
            break
        default:
            unreachable(type)
    }
    const mainContract = new ContractPromise(api, abi, address)
    return mainContract
}

export default ConnectContract
