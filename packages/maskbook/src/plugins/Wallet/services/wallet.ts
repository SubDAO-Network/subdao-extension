import { createTransaction } from '../../../database/helpers/openDB'
import { createWalletDBAccess } from '../database/Wallet.db'
import type { WalletRecord } from '../database/types'
import { WalletMessages } from '../messages'
import { assert } from '../../../utils/utils'
import { ProviderType } from '../../../web3/types'
import { resolveProviderName } from '../../../web3/pipes'
import { formatChecksumAddress } from '../formatter'
import { getWalletByAddress, WalletRecordIntoDB, WalletRecordOutDB } from './helpers'
import { isSameAddress } from '../../../web3/helpers'
import { currentSelectedWalletAddressSettings } from '../settings'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { selectSubDAOWallet } from '../helpers'
import { generateSeed, addressFromSeed } from './keyring'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { SubstrateNetworkPrefix } from '../../../polkadot/constants'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"

function sortWallet(a: WalletRecord, b: WalletRecord) {
    const address = currentSelectedWalletAddressSettings.value
    if (a.address === address) return -1
    if (b.address === address) return 1
    if (a.updatedAt > b.updatedAt) return -1
    if (a.updatedAt < b.updatedAt) return 1
    if (a.createdAt > b.createdAt) return -1
    if (a.createdAt < b.createdAt) return 1
    return 0
}

export async function isEmptyWallets() {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const count = await t.objectStore('Wallet').count()
    return count === 0
}

export async function getWallet(address: string = currentSelectedWalletAddressSettings.value) {
    const wallets = await getWallets()
    return wallets.find((x) => isSameAddress(x.address, address))
}

export async function getWallets(provider?: ProviderType) {
    const t = createTransaction(await createWalletDBAccess(), 'readonly')('Wallet')
    const records = await t.objectStore('Wallet').getAll()
    const wallets = (
        await Promise.all<WalletRecord>(
            records.map(async (record) => {
                const walletRecord = WalletRecordOutDB(record)
                return {
                    ...walletRecord,
                }
            }),
        )
    ).sort(sortWallet)
    if (provider === ProviderType.SubDAO) {
        return wallets.filter((x) => x.networkPrefix === undefined || x.networkPrefix === SubstrateNetworkPrefix.SubDAO)
    }

    if (provider === ProviderType.Polkadot) {
        return wallets.filter((x) => x.networkPrefix === SubstrateNetworkPrefix.Polkadot)
    }

    if (provider === ProviderType.Kusama) {
        return wallets.filter((x) => x.networkPrefix === SubstrateNetworkPrefix.Kusama)
    }
    return wallets
}

export async function updateExoticWalletFromSource(
    provider: ProviderType,
    updates: Map<string, Partial<WalletRecord>>,
): Promise<void> {
    const walletStore = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet').objectStore('Wallet')
    let modified = false
    for await (const cursor of walletStore) {
        const wallet = cursor.value
        {
            if (updates.has(formatChecksumAddress(wallet.address))) {
                await cursor.update(
                    WalletRecordIntoDB({
                        ...WalletRecordOutDB(cursor.value),
                        ...updates.get(wallet.address)!,
                        updatedAt: new Date(),
                    }),
                )
            }
            modified = true
        }
    }
    for (const address of updates.keys()) {
        const wallet = await walletStore.get(formatChecksumAddress(address))
        if (wallet) continue
        await walletStore.put(
            WalletRecordIntoDB({
                address,
                createdAt: new Date(),
                updatedAt: new Date(),
                erc20_token_blacklist: new Set(),
                erc20_token_whitelist: new Set(),
                name: resolveProviderName(provider),
                passphrase: '',
                mnemonic: [] as string[],
                ...updates.get(address)!,
            }),
        )
        modified = true
    }
    if (modified) WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export function createNewWallet(
    rec: Omit<
        WalletRecord,
        | 'id'
        | 'eth_balance'
        | '_data_source_'
        | 'erc20_token_balance'
        | 'erc20_token_whitelist'
        | 'erc20_token_blacklist'
        | 'createdAt'
        | 'updatedAt'
    >,
) {
    if (!rec.mnemonic) {
        rec.mnemonic = mnemonicGenerate().split(' ')
    }
    return importNewWallet({ ...rec })
}

export async function importNewWallet(
    rec: PartialRequired<
        Omit<WalletRecord, 'id' | 'eth_balance' | '_data_source_' | 'erc20_token_balance' | 'createdAt' | 'updatedAt'>,
        'name'
    >,
) {
    const { name, suri, mnemonic = [], passphrase = '' } = rec
    const address = await getWalletAddress()
    if (!address) throw new Error('cannot get the wallet address')
    if (rec.name === null) rec.name = address.slice(0, 6)
    const network = currentSubstrateNetworkSettings.value
    const networkPrefix = rec.networkPrefix ?? SubstrateNetworkPrefix[network]
    const record: WalletRecord = {
        name,
        mnemonic,
        suri,
        passphrase,
        address,
        erc20_token_whitelist: new Set(),
        erc20_token_blacklist: new Set(),
        createdAt: new Date(),
        updatedAt: new Date(),
        networkPrefix,
    }
    if (rec._private_key_) record._private_key_ = rec._private_key_
    {
        const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet', 'ERC20Token')
        const record_ = await t.objectStore('Wallet').get(record.address)
        if (!record_) await t.objectStore('Wallet').add(WalletRecordIntoDB(record))
        else if (!record_.mnemonic.length && !record_._private_key_)
            await t.objectStore('Wallet').put(WalletRecordIntoDB(record))
    }
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
    selectSubDAOWallet(record)
    return address
    async function getWalletAddress() {
        if (rec.address) return rec.address
        if (rec.mnemonic?.length) return addressFromSeed(rec.mnemonic.join(' '), '')
        if (rec._private_key_) return addressFromSeed(rec._private_key_, '')
        return ''
    }
}

export async function importFirstWallet(rec: Parameters<typeof importNewWallet>[0]) {
    if (await isEmptyWallets()) {
        if (!rec.mnemonic?.length) {
            const { address, seed } = generateSeed(null, '', 'bip')
            rec.mnemonic = seed.split(' ')
            rec.address = address
        }
        return importNewWallet(rec)
    }
    return
}

export async function renameWallet(address: string, name: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    assert(wallet)
    wallet.name = name
    wallet.updatedAt = new Date()
    await t.objectStore('Wallet').put(WalletRecordIntoDB(wallet))
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}

export async function removeWallet(address: string) {
    const t = createTransaction(await createWalletDBAccess(), 'readwrite')('Wallet')
    const wallet = await getWalletByAddress(t, formatChecksumAddress(address))
    if (!wallet) return
    await t.objectStore('Wallet').delete(wallet.address)
    WalletMessages.events.walletsUpdated.sendToAll(undefined)
}
