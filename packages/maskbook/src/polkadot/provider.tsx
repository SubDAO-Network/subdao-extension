import React, { useEffect, useReducer, useContext, Reducer } from 'react'
import { ActionType, State, ContractContextType } from './types'
import { reducer, INIT_STATE } from './storage'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { ws_server } from './constants'

const connectApi = async (state: any, dispatch: any) => {
    const { apiState } = state

    if (apiState) return

    dispatch({ type: ActionType.CONNECT_INIT })
    const wsProvider = new WsProvider(ws_server)
    const api = await ApiPromise.create({
        provider: wsProvider,
        types: {
            Address: 'MultiAddress',
            LookupSource: 'MultiAddress',
        },
    })
    if (api.isConnected) {
        dispatch({
            type: ActionType.CONNECT,
            payload: api,
        })
    }
    await api.isReady.then(() => dispatch({ type: ActionType.CONNECT_SUCCESS }))
}

const initState = { ...INIT_STATE }
const SubstrateContext = React.createContext<ContractContextType | undefined>(undefined)

interface Props {
    children?: React.ReactElement
}

export const SubstrateContextProvider = (props: Props) => {
    const [state, dispatch] = useReducer(reducer, initState)
    connectApi(state, dispatch)

    return <SubstrateContext.Provider value={{ state, dispatch }}>{props.children}</SubstrateContext.Provider>
}

export const useSubstrate = () => ({ ...useContext(SubstrateContext) })

export const useApi = (): any => {
    const { state } = useSubstrate()
    const api = state?.api || null
    return { api, state }
}
