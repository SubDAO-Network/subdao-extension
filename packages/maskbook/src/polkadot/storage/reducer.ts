import type { Action, State } from '../types'
import { ActionType, StateType } from '../types'

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        //api
        case ActionType.CONNECT_INIT:
            return {
                ...state,
                apiState: ActionType.CONNECT_INIT,
            }

        case ActionType.CONNECT:
            return {
                ...state,
                api: action.payload.api,
                apiState: StateType.CONNECTING,
                apiProvider: action.payload.provider,
            }

        case ActionType.CONNECT_SUCCESS:
            return { ...state, apiState: StateType.READY }

        case ActionType.CONNECT_ERROR:
            return { ...state, apiState: StateType.ERROR, apiError: action.payload }

        //main contract
        case ActionType.LOAD_MAINCONTRACT:
            return { ...state, maincontractState: StateType.LOADING }

        case ActionType.SET_MAINCONTRACT:
            return { ...state, maincontract: action.payload, maincontractState: StateType.READY }

        case ActionType.MAINCONTRACT_ERROR:
            return { ...state, maincontract: null, maincontractState: StateType.ERROR }

        // vault
        case ActionType.LOAD_VAULT:
            return { ...state, vaultcontractState: StateType.LOADING }

        case ActionType.SET_VAULT:
            return { ...state, vaultcontract: action.payload, vaultcontractState: 'READY' }

        case ActionType.VAULT_ERROR:
            return { ...state, vaultcontract: null, vaultcontractState: 'ERROR' }

        case ActionType.SET_TRANSFER_STATE:
            return { ...state, transferState: action.payload }

        default:
            throw new Error(`Unknown type: ${action.type}`)
    }
}

export default reducer
