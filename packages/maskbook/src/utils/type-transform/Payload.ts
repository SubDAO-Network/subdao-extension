import type { SocialNetwork } from '../../social-network'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { i18n } from '../i18n-next'
import { Result, Ok, Err } from 'ts-results'
import { Identifier, ProfileIdentifier } from '../../database/type'
import { decodeTextPayloadUI, encodeTextPayloadUI } from '../../social-network/utils/text-payload-ui'
import { VERSION, flagChart } from '../../crypto/constants'

export type Payload = PayloadAlpha20
export type PayloadOld = PayloadAlpha40_Or_Alpha39 | PayloadAlpha38
export type PayloadLatest = PayloadAlpha20

export interface PayloadAlpha38 {
    version: typeof VERSION.validate
    AESKeyEncrypted: string
    iv: string
    encryptedText: string
    /** @deprecated but don't remove it cause it will break */
    signature: string
    authorPublicKey?: string
    authorUserID?: ProfileIdentifier
    sharedPublic?: boolean
}
export interface PayloadAlpha40_Or_Alpha39 {
    version: typeof VERSION.validate
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
export interface PayloadAlpha20 {
    version: typeof VERSION.validate
    AESKeyEncrypted: string
    ownersAESKeyEncrypted?: string
    iv: string
    encryptedText: string
    /** @deprecated but don't remove it cause it will break */
    signature: string
    authorPublicKey?: string
    authorUserID?: ProfileIdentifier
    sharedPublic?: boolean
}

/**
 * Detect if there is version -40, -39 or -38 payload
 */
function deconstructAlpha40_Or_Alpha39_Or_Alpha38(str: string, throws = false): PayloadOld | null {
    // ? payload is 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼3/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    // ? payload is 🎼4/4|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier:||
    // ? if publicShared is true, that means AESKeyEncrypted is shared with public
    // ? "1" treated as true, "0" or not defined treated as false
    // ? authorIdentifier is encoded as `${network}/${id}`
    const isVersion40 = str.includes(flagChart + '2/4')
    const isVersion39 = str.includes(flagChart + '3/4')
    const isVersion38 = str.includes(flagChart + '4/4')
    str = str.replace(flagChart + '2/4', flagChart + '3/4')
    str = str.replace(flagChart + '3/4', flagChart + '4/4')
    const [_, payloadStart] = str.split(flagChart + '4/4|')
    if (!payloadStart)
        if (throws) throw new Error(i18n.t('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(i18n.t('payload_incomplete'))
        else return null
    const [AESKeyEncrypted, iv, encryptedText, signature, ...optional] = payload.split('|')
    const [authorPublicKey, publicShared, authorID, ...extra] = optional
    if (!(AESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error(i18n.t('payload_bad'))
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    if (isVersion38) {
        if (!signature) throw new Error(i18n.t('payload_bad'))
        return {
            version: -38,
            AESKeyEncrypted,
            iv,
            encryptedText,
            signature,
            authorPublicKey,
            sharedPublic: publicShared === '1',
            authorUserID: Result.wrap(() =>
                Identifier.fromString('person:' + atob(authorID), ProfileIdentifier).unwrap(),
            ).unwrapOr(undefined),
        }
    }
    return {
        ownersAESKeyEncrypted: AESKeyEncrypted,
        iv,
        encryptedText,
        signature,
        version: VERSION.validate,
    }
}

function deconstructAlpha41(str: string, throws = false): null | never {
    // 🎼1/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
    if (str.includes(flagChart + '1/4') && str.includes(':||'))
        if (throws) throw new Error(i18n.t('payload_throw_in_alpha41'))
        else return null
    return null
}

function deconstructAlpha20(str: string, throws = false): null | Payload {
    // ? payload is 🎼1/9|AESKeyEncrypted|iv|encryptedText|signature|authorPublicKey?|publicShared?|authorIdentifier:||
    const startString = `${flagChart}1/9`
    if (!str.includes(startString)) {
        if (!throws) return null
        else throw new Error(i18n.t('payload_throw_in_alpha'))
    }

    const [_, payloadStart] = str.split(`${startString}|`)
    if (!payloadStart)
        if (throws) throw new Error(i18n.t('payload_not_found'))
        else return null
    const [payload, rest] = payloadStart.split(':||')
    if (rest === undefined)
        if (throws) throw new Error(i18n.t('payload_incomplete'))
        else return null
    const [AESKeyEncrypted, iv, encryptedText, signature, ...optional] = payload.split('|')
    const [authorPublicKey, publicShared, authorID, ...extra] = optional
    if (!(AESKeyEncrypted && iv && encryptedText))
        if (throws) throw new Error(i18n.t('payload_bad'))
        else return null
    if (extra.length) console.warn('Found extra payload', extra)
    return {
        version: -20,
        AESKeyEncrypted,
        iv,
        encryptedText,
        signature,
        authorPublicKey,
        sharedPublic: publicShared === '1',
        authorUserID: Result.wrap(() =>
            Identifier.fromString('person:' + atob(authorID), ProfileIdentifier).unwrap(),
        ).unwrapOr(undefined),
    }
}

const versions = new Set([deconstructAlpha20])

/**
 * @type Decoder - defines decoder. if null, auto select decoder.
 */
type Decoder = SocialNetwork.PayloadEncoding['decoder'] | null
type Encoder = SocialNetwork.PayloadEncoding['encoder']

export function deconstructPayload(str: string, networkDecoder?: Decoder): Result<Payload, TypeError> {
    if (!networkDecoder) {
        networkDecoder = isEnvironment(Environment.ContentScript) ? decodeTextPayloadUI : (x) => [x]
    }

    for (const versionDecoder of versions) {
        const results = networkDecoder(str)
        for (const result of results) {
            if (!result) continue
            const payload = versionDecoder(result, false)
            if (payload) return Ok(payload)
        }
    }
    if (str.includes(flagChart) && str.includes(':||')) return Err(new TypeError(i18n.t('service_unknown_payload')))
    return Err(new TypeError(i18n.t('payload_not_found')))
}

export function constructAlpha20(data: PayloadAlpha20, encoder?: Encoder) {
    if (!encoder) {
        encoder = isEnvironment(Environment.ContentScript) ? encodeTextPayloadUI : (x) => x
    }
    const userID = data.authorUserID?.toText().replace('person:', '') || ''
    const fields = [
        data.AESKeyEncrypted,
        data.iv,
        data.encryptedText,
        data.signature,
        data.authorPublicKey,
        data.sharedPublic ? '1' : '0',
        userID.includes('|') ? undefined : btoa(userID),
    ]
    return encoder(`${flagChart}1/9|${fields.join('|')}:||`)
}

/**
 * The string part is in the front of the payload.
 * The number part is used in the database.
 */
export enum Versions {
    '2/4' = -40,
    '3/4' = -39,
    '4/4' = -38,
    '1/9' = -20,
}
