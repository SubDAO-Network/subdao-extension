import type { SocialNetworkUI } from '../../../social-network'

const en = ['This tweet is encrypted with SubDAO (@subdao_network). 📪🔑', 'Install {{encrypted}} to decrypt it.'].join(
    '\n\n',
)
const zh = ['此推文已被 SubDAO（@subdao_network）加密。📪🔑', '请安装 {{encrypted}} 进行解密。'].join('\n\n')
export const oldTwitterI18NOverwrite = {
    en: { additional_post_box__encrypted_post_pre: en },
    zh: { additional_post_box__encrypted_post_pre: zh },
}

export const i18NOverwriteTwitter: SocialNetworkUI.Customization.I18NOverwrite = {
    mask: {
        additional_post_box__encrypted_post_pre: { en, zh },
    },
}
