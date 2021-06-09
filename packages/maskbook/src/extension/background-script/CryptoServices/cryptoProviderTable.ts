import * as Alpha20 from '../../../crypto/crypto-alpha-20'
import { VERSION, isValidVersion } from '../../../crypto/constants'

export const cryptoProviderTable = {
    [VERSION.validate]: Alpha20,
} as const

export const getCryptoProvider = (version: typeof VERSION.validate) => {
    if (!isValidVersion(version)) throw new Error(`Invalid version Alpha`)

    return cryptoProviderTable[version]
}
