import { getApi } from './base'
import {
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
} from '../../../plugins/Wallet/settings'
import type { DeriveBalancesAll } from '@polkadot/api-derive/types'
import { formatBalance } from '@polkadot/util'
import { networkNativeTokens } from '../../../polkadot/constants'

export const getBalancesAll = async (address?: string): Promise<DeriveBalancesAll | undefined> => {
    const ADDR = address ?? currentSelectedWalletAddressSettings.value
    const api = await getApi()
    if (!api) {
        return undefined
    }
    return api?.derive?.balances?.all(ADDR)
}

export const getFreeBalances = async (address?: string): Promise<string> => {
    const ADDR = address ?? currentSelectedWalletAddressSettings.value
    const api = await getApi()
    if (!api) {
        return '0'
    }
    const { freeBalance: balance } = await api?.derive?.balances?.all(ADDR)
    return balance.toString()
}

export const getFormatFreeBalances = async (address?: string): Promise<string> => {
    const ADDR = address ?? currentSelectedWalletAddressSettings.value
    const api = await getApi()
    if (!api) {
        return '0'
    }
    const { freeBalance: balance } = await api?.derive?.balances?.all(ADDR)
    if (!balance) {
        return '0'
    }
    const provider = currentSelectedWalletProviderSettings.value
    const tokenDetail = networkNativeTokens[provider]
    return formatBalance(balance, { forceUnit: '-', decimals: tokenDetail.decimals, withUnit: tokenDetail.symbol })
}
