import { keyring } from '@polkadot/ui-keyring'
import { isHex, u8aToHex } from '@polkadot/util'
import {
    hdLedger,
    hdValidatePath,
    keyExtractSuri,
    mnemonicGenerate,
    mnemonicValidate,
    mnemonicToEntropy,
    mnemonicToMiniSecret,
    randomAsU8a,
} from '@polkadot/util-crypto'

const ETH_DEFAULT_PATH = "m/44'/60'/0'/0/0"

import { DEV_PHRASE } from '@polkadot/keyring/defaults'
import { keypairType, ss58Format } from '../../../polkadot/constants'
const DEFAULT_PAIR_TYPE = keypairType

export type PairType = 'ecdsa' | 'ed25519' | 'ed25519-ledger' | 'ethereum' | 'sr25519'

export type SeedType = 'bip' | 'raw' | 'dev'

export interface AddressState {
    address: string
    suri: string | null
    derivePath: string
    deriveValidation?: DeriveValidationOutput
    isSeedValid: boolean
    pairType: PairType
    seed: string
    seedType: SeedType
}

interface DeriveValidationOutput {
    error?: string
    warning?: string
}

export function getSuri(seed: string, derivePath: string, pairType: PairType): string {
    return pairType === 'ed25519-ledger'
        ? u8aToHex(hdLedger(seed, derivePath).secretKey.slice(0, 32))
        : pairType === 'ethereum'
        ? `${seed}/${derivePath}`
        : `${seed}${derivePath}`
}

export function addressFromSeed(seed: string, derivePath: string, pairType: PairType = 'sr25519'): string {
    return keyring.createFromUri(
        getSuri(seed, derivePath, pairType),
        {},
        pairType === 'ed25519-ledger' ? 'ed25519' : pairType,
    ).address
}

export function newSeed(seed: string | undefined | null, seedType: SeedType): string {
    switch (seedType) {
        case 'bip':
            return mnemonicGenerate()
        case 'dev':
            return DEV_PHRASE
        default:
            return seed || u8aToHex(randomAsU8a())
    }
}

export function generateSeed(
    _seed: string | undefined | null,
    derivePath: string,
    seedType: SeedType = 'bip',
    pairType: PairType = DEFAULT_PAIR_TYPE,
    ss58: number = ss58Format,
): AddressState {
    const seed = newSeed(_seed, seedType)
    const suri = addressFromSeed(seed, derivePath, pairType)
    const address = keyring.encodeAddress(suri, ss58)
    console.log(suri, address)

    return {
        suri,
        address,
        derivePath,
        deriveValidation: undefined,
        isSeedValid: true,
        pairType,
        seed,
        seedType,
    }
}

export function updateAddress(seed: string, derivePath: string, seedType: SeedType, pairType: PairType): AddressState {
    let address: string = ''
    let deriveValidation: DeriveValidationOutput = deriveValidate(seed, seedType, derivePath, pairType)
    let isSeedValid = seedType === 'raw' ? rawValidate(seed) : mnemonicValidate(seed)

    if (!deriveValidation?.error && isSeedValid) {
        try {
            address = addressFromSeed(seed, derivePath, pairType)
        } catch (error) {
            console.error(error)
            deriveValidation = {
                error: (error as Error).message ? (error as Error).message : (error as Error).toString(),
            }
            isSeedValid = false
        }
    }

    return {
        address,
        suri: '',
        derivePath,
        deriveValidation,
        isSeedValid,
        pairType,
        seed,
        seedType,
    }
}

export function deriveValidate(
    seed: string,
    seedType: SeedType,
    derivePath: string,
    pairType: PairType,
): DeriveValidationOutput {
    try {
        const { password, path } = keyExtractSuri(
            pairType === 'ethereum' ? `${seed}/${derivePath}` : `${seed}${derivePath}`,
        )
        let result: DeriveValidationOutput = {}

        // show a warning in case the password contains an unintended / character
        if (password?.includes('/')) {
            result = { warning: 'WARNING_SLASH_PASSWORD' }
        }

        // we don't allow soft for ed25519
        if (pairType === 'ed25519' && path.some(({ isSoft }): boolean => isSoft)) {
            return { ...result, error: 'SOFT_NOT_ALLOWED' }
        }

        // we don't allow password for hex seed
        if (seedType === 'raw' && password) {
            return { ...result, error: 'PASSWORD_IGNORED' }
        }

        if (pairType === 'ethereum' && !hdValidatePath(derivePath)) {
            return { ...result, error: 'INVALID_DERIVATION_PATH' }
        }

        return result
    } catch (error) {
        return { error: (error as Error).message }
    }
}

export function rawValidate(seed: string): boolean {
    return (seed.length > 0 && seed.length <= 32) || isHexSeed(seed)
}

export function isHexSeed(seed: string): boolean {
    return isHex(seed) && seed.length === 66
}

export function mnemonicToRaw(str: string): string {
    const arr = mnemonicToMiniSecret(str)
    console.log(arr)
    return u8aToHex(arr)
}
