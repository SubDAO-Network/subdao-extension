import * as Alpha20 from '../../../crypto/crypto-alpha-20'
import { GunAPI as Gun2 } from '../../../network/gun/'
import { ProfileIdentifier, PostIVIdentifier } from '../../../database/type'
import { prepareRecipientDetail } from './prepareRecipientDetail'
import { getCryptoProvider } from './cryptoProviderTable'
import { updatePostDB, RecipientDetail, RecipientReason } from '../../../database/post'
import { getNetworkWorkerUninitialized } from '../../../social-network/worker'
import { queryPrivateKey, queryLocalKey } from '../../../database'
import { IdentifierMap } from '../../../database/IdentifierMap'
import type { AESJsonWebKey, EC_Private_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'
import { isValidVersion } from '../../../crypto/constants'
import type { VERSION } from '../../../crypto/constants'

export async function appendShareTarget(
    version: typeof VERSION.validate,
    postAESKey: string | AESJsonWebKey,
    iv: string,
    people: ProfileIdentifier[],
    whoAmI: ProfileIdentifier,
    reason: RecipientReason,
): Promise<void> {
    const cryptoProvider = getCryptoProvider(version)
    if (typeof postAESKey === 'string') {
        const AESKey = await cryptoProvider.extractAESKeyInMessage(
            version,
            postAESKey,
            iv,
            (await queryLocalKey(whoAmI))!,
        )
        return appendShareTarget(version, AESKey, iv, people, whoAmI, reason)
    }
    const myPrivateKey: EC_Private_JsonWebKey = (await queryPrivateKey(whoAmI))!
    if (!isValidVersion(version)) {
        throw new TypeError(`Version ${version} cannot create new data anymore due to leaking risks.`)
    }

    const [, toKey] = await prepareRecipientDetail(people)
    const othersAESKeyEncrypted = await Alpha20.generateOthersAESKeyEncrypted(
        version,
        postAESKey,
        myPrivateKey,
        Array.from(toKey.values()),
    )
    const gunHint = getNetworkWorkerUninitialized(whoAmI)?.gunNetworkHint
    gunHint && Gun2.publishPostAESKeyOnGun2(version, iv, gunHint, othersAESKeyEncrypted)
    updatePostDB(
        {
            identifier: new PostIVIdentifier(whoAmI.network, iv),
            recipients: new IdentifierMap(
                new Map(
                    people.map<[string, RecipientDetail]>((identifier) => [
                        identifier.toText(),
                        {
                            reason: [reason],
                            published: toKey.has(identifier),
                        },
                    ]),
                ),
                ProfileIdentifier,
            ),
        },
        'append',
    )
}
