import type { State } from '../types'

const initialState: State = {
    api: null,
    apiError: null,
    apiState: null,

    transferState: null,

    allAccounts: null,
    allaccountsState: null,

    maincontractState: null,
    maincontract: null,

    basecontractState: null,
    basecontract: null,

    erc20contractState: null,
    erc20contract: null,

    orgcontractState: null,
    orgcontract: null,

    vaultcontractState: null,
    vaultcontract: null,

    votecontractState: null,
    votecontract: null,

    daoManagercontractState: null,
    daoManagercontract: null,
}

export default initialState
