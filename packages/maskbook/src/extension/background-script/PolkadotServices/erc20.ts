import ConnectContract from '../../../polkadot/connect'
import { ws_server, voteAddress } from '../../../polkadot/constants'
import { ContractType } from '../../../polkadot/types'
import { getSigner, getNonce } from './sign'
import { currentSelectedWalletAddressSettings } from '../../../plugins/Wallet/settings'
import type { PollMetaData, VoteData, VoteChoiseData } from '../../../plugins/Polls/types'
import type { ERC20TokenDetailed } from '../../../web3/types'
import type { TokenDetailed } from '../../../polkadot/types'
import { EthereumTokenType } from '../../../web3/types'
import { getApi } from './base'
import { formatResult } from './helper'
import type { DaoAddresses } from '../../../polkadot/types'
import { erc20Address as erc20AddressItem } from '../../../polkadot/constants'
import { formatBalance } from '@polkadot/util'
import { isValidAddress } from '../../../plugins/Wallet/services/formatter'
import { memoizePromise } from '@dimensiondev/kit'

const value = 0
const gasLimit = -1

export const getERC20Contract = async (address: string) => {
    return initERC20Contract(address)
}

export async function initERC20Contract(address: string) {
    const api = await getApi()
    return await ConnectContract(api, ContractType.erc20, address)
}

export const getERC20Balance = async (erc20Address: string) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const erc20Contract = await getERC20Contract(erc20Address)
    if (!erc20Contract) return
    const data = await (erc20Contract as any)?.query?.balanceOf(address, { value, gasLimit }, address)
    return data?.output?.toString()
}

export const getERC20Allowance = async (erc20Address: string, spender?: string) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const erc20Contract = await getERC20Contract(erc20Address)
    if (!erc20Contract) return

    const data = await (erc20Contract as any)?.query?.allowance(address, { value, gasLimit }, address, spender)
    console.log(`allowance`, data?.output?.toString())
    return data?.output?.toString()
}

export const approve = async (erc20Address: string, spender?: string, amount?: any) => {
    const address = currentSelectedWalletAddressSettings.value
    if (!address) return
    const erc20Contract = await getERC20Contract(erc20Address)
    if (!erc20Contract) return

    const signer = await getSigner()
    const nonce = await getNonce()
    return new Promise(async (resolve, reject) => {
        await (erc20Contract as any)
            ?.exec('approve', { value, gasLimit }, spender, amount)
            .signAndSend(signer, { nonce }, (res: any) => {
                console.log(`approve res.status....`, res.status)
                if (res?.status?.isFinalized) {
                    resolve('finalized')
                }
            })
    })
}

export async function fetchBalancesOfERC20(address: string): Promise<number> {
    const contract = await getERC20Contract(address)
    const _address = currentSelectedWalletAddressSettings.value

    if (!contract || !_address || !address) return 0 as number

    const res = await (contract as any)?.query?.balanceOf(_address, { value, gasLimit }, _address)
    const data = formatResult(res)
    return Number(data.replace(/,/g, ''))
}

export async function fetchFormatBalancesOfERC20(token: TokenDetailed | null): Promise<string> {
    if (!token) return '0'

    const balance = await fetchBalancesOfERC20(token.address)
    if (balance === 0) return '0'

    return formatBalance(balance, { decimals: token.decimals, forceUnit: '-', withUnit: token.symbol })
}

export async function fetchERC20Name(address: string) {
    const contract = await getERC20Contract(address)
    const _address = address ?? currentSelectedWalletAddressSettings.value
    if (!contract || !_address) return
    const res = await (contract as any)?.query?.name(_address, { value, gasLimit })
    const data = formatResult(res)
    console.log(data)
    return data
}

export async function fetchERC20Info(address: string): Promise<ERC20TokenDetailed> {
    if (!isValidAddress(address)) return {} as ERC20TokenDetailed

    const contract = await getERC20Contract(address)
    const _address = currentSelectedWalletAddressSettings.value

    if (!contract || !_address) return {} as ERC20TokenDetailed

    const [name, decimals, symbol] = await Promise.all([
        (contract as any)?.query?.name(_address, { value, gasLimit }),
        (contract as any)?.query?.decimals(_address, { value, gasLimit }),
        (contract as any)?.query?.symbol(_address, { value, gasLimit }),
        // (contract as any)?.query?.balanceOf(_address, { value, gasLimit }, _address),
        // (contract as any)?.query?.totalSupply(_address, { value, gasLimit }),
    ])

    const data = {
        address,
        decimals: Number(formatResult(decimals)),
        symbol: formatResult(symbol),
        name: formatResult(name),
        chainId: 1,
        type: EthereumTokenType.ERC20,
        // total: formatResult(totalSupply),
    } as ERC20TokenDetailed
    return data
}

export async function fetchBalancesOfERC20List(addresses: string[]) {
    return new Promise((resolve, reject) => {
        if (!addresses || !addresses.length) {
            return reject('cannot find data')
        }

        const tokens = Promise.allSettled(
            addresses.filter((x) => x).map((address) => fetchBalancesOfERC20(address)),
        ).then((arr) => {
            const res = arr.filter((o) => o.status === 'fulfilled').map((x) => (x as any).value)
            if (res.length > 0) {
                resolve(res)
            } else {
                reject('cannot find data')
            }
        })
    })
}

export async function fetchAllERC20Infos(list: DaoAddresses[]): Promise<ERC20TokenDetailed[]> {
    return new Promise((resolve, reject) => {
        if (!list || !list.length) {
            return reject('cannot find data')
        }

        list.push({
            base_addr: '',
            vote_addr: '',
            org_addr: '',
            erc20_addr: erc20AddressItem.test,
        })
        const tokens = Promise.allSettled(
            list.filter((x) => x.erc20_addr).map((item) => fetchERC20Info(item.erc20_addr)),
        ).then((arr) => {
            const res: ERC20TokenDetailed[] = arr.filter((o) => o.status === 'fulfilled').map((x) => (x as any).value)
            if (res.length > 0) {
                resolve(res)
            } else {
                reject('cannot find data')
            }
        })
    })
}

export async function transferERC20(erc20Address: string, recipient: string, amount: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        if (!erc20Address || amount <= 0 || !isValidAddress(recipient)) return resolve(false)
        const contract = await getERC20Contract(erc20Address)
        const signer = await getSigner()
        const nonce = await getNonce()
        const data = await (contract as any)
            .exec('transfer', { value: 0, gasLimit: -1 }, recipient, amount)
            .signAndSend(signer, { nonce }, (res: any) => {
                if (res?.status?.isFinalized) {
                    console.log(formatResult(res.output))
                    resolve(true)
                }
            })
    })
}

interface TokenList {
    name: string
    timestamp: string
    tokens: {
        address: string
        name: string
        symbol: string
        decimals: number
    }[]
    version: {
        major: number
        minor: number
        patch: number
    }
}

const fetchTokenList = memoizePromise(
    async (url: string) => {
        const response = await fetch(url, { cache: 'force-cache' })
        return response.json() as Promise<TokenList>
    },
    (url) => url,
)

/**
 * Fetch tokens from token list
 * @param url
 */
export async function fetchERC20TokensFromTokenList(url: string): Promise<ERC20TokenDetailed[]> {
    return (await fetchTokenList(url)).tokens.map((x) => ({
        type: EthereumTokenType.ERC20,
        chainId: 1,
        ...x,
    }))
}

/**
 * Fetch tokens from multiple token lists
 * @param urls
 */
export async function fetchERC20TokensFromTokenLists(urls: string[]): Promise<ERC20TokenDetailed[]> {
    const uniqueSet = new Set<string>()
    const tokens = (await Promise.allSettled(urls.map((x) => fetchERC20TokensFromTokenList(x)))).flatMap((x) =>
        x.status === 'fulfilled' ? x.value : [],
    )
    return tokens.filter((x) => {
        // checksummed address in one loop
        const key = x.address.toLowerCase()
        if (uniqueSet.has(key)) return false
        else {
            uniqueSet.add(key)
            return true
        }
    })
}
