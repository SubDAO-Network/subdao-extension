import React, { useReducer, useContext, useMemo } from 'react'
import { ActionType, ContractContextType } from './types'
import { reducer, INIT_STATE } from './storage'
import { ApiPromise, WsProvider } from '@polkadot/api'

const connectApi = async (state: any, dispatch: any, provider: string) => {
    const { apiState, apiProvider } = state
    if (apiState && apiProvider === provider) return

    dispatch({ type: ActionType.CONNECT_INIT })
    const wsProvider = new WsProvider(provider)
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
            payload: { api, provider },
        })
    }
    await api.isReady.then(() => dispatch({ type: ActionType.CONNECT_SUCCESS }))
}

const initState = { ...INIT_STATE }
const SubstrateContext = React.createContext<ContractContextType | undefined>(undefined)

interface Props {
    children?: React.ReactElement
    provider: string
}

export const SubstrateContextProvider = (props: Props) => {
    const [state, dispatch] = useReducer(reducer, initState)
    useMemo(() => connectApi(state, dispatch, props.provider), [props.provider])

    return <SubstrateContext.Provider value={{ state, dispatch }}>{props.children}</SubstrateContext.Provider>
}

export const useSubstrate = () => ({ ...useContext(SubstrateContext) })

export const useApi = (): any => {
    const { state } = useSubstrate()
    const api = state?.api || null
    return { api, state }
}
