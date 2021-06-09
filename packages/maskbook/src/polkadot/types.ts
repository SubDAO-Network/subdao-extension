import type { ApiPromise } from '@polkadot/api'
import type { DeriveBalancesAll } from '@polkadot/api-derive/types'
import type { PolkadotTransactionStateType } from './hooks/useTransactionState'

import type { ERC20Token } from '../web3/types'

export type State = {
    api: ApiPromise | null
    apiError: string | null
    apiState: string | null
    transferState: PolkadotTransactionStateType | null

    allAccounts: string | null
    allaccountsState: string | null

    maincontractState: string | null
    maincontract: ApiPromise | null

    basecontractState: string | null
    basecontract: ApiPromise | null

    erc20contractState: string | null
    erc20contract: ApiPromise | null

    orgcontractState: string | null
    orgcontract: ApiPromise | null

    vaultcontractState: string | null
    vaultcontract: ApiPromise | null

    votecontractState: string | null
    votecontract: ApiPromise | null

    daoManagercontractState: string | null
    daoManagercontract: ApiPromise | null
}

export enum ContractType {
    base,
    main,
    erc20,
    org,
    vault,
    vote,
    redPacket,
    dao,
}

export type Action = {
    type: ActionType
    payload: any
}

export const enum ActionType {
    CONNECT_INIT = 'CONNECT_INIT',
    CONNECT = 'CONNECT',
    CONNECT_SUCCESS = 'CONNECT_SUCCESS',
    CONNECT_ERROR = 'CONNECT_ERROR',
    LOAD_MAINCONTRACT = 'LOAD_MAINCONTRACT',
    SET_MAINCONTRACT = 'SET_MAINCONTRACT',
    MAINCONTRACT_ERROR = 'MAINCONTRACT_ERROR',
    SET_VAULT = 'SET_VAULT',
    LOAD_VAULT = 'LOAD_VAULT',
    VAULT_ERROR = 'VAULT_ERROR',
    SET_TRANSFER_STATE = 'SET_TRANSFER_STATE',
}

export const enum StateType {
    CONNECT_INIT = 'CONNECT_INIT',
    CONNECTING = 'CONNECTING',
    READY = 'READY',
    ERROR = 'ERROR',
    LOADING = 'LOADING',
}

export interface PolkadotTokenDetailed extends ERC20Token {
    name?: string
    symbol?: string
    decimals: number
}

type DispatchType = (arg0: any) => void

export interface ContractContextType {
    state: State
    dispatch: DispatchType
}

export enum PolkadotTokenType {
    DOT = 0,
    ERC20 = 1,
}

export interface TokenDetailed extends ERC20Token {
    name: string
    symbol: string
    decimals: number
    address: string
}

export interface TokenDetailedType {
    balanceAll?: DeriveBalancesAll
    address: string
    token: TokenDetailed
}

export interface DaoAddresses {
    dao_address?: string
    base_addr: string
    erc20_addr: string
    vote_addr: string
    org_addr: string
}

export interface DaoInstances {
    name: string
    logo: string
    desc: string
    owner: string
}

export interface DaoInstanceDataMeta {
    id: string
    owner: string
    dao_manager_addr: string
    dao_manager?: {
        account_id?: string
    }
}

export interface DaoBaseInfoDataMeta {
    address: string
    desc: string
    name: string
    owner?: string
}

export interface ERC20TokenDetailed extends ERC20Token {
    name?: string
    symbol?: string
    decimals: number
    total?: number
}
