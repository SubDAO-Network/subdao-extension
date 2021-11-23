export type ToolIconTypes =
    | 'airdrop'
    | 'encryptedmsg'
    | 'files'
    | 'markets'
    | 'redpacket'
    | 'swap'
    | 'token'
    | 'more'
    | 'moreDark'
    | 'copy'

export const ToolIconURLs: Readonly<Record<ToolIconTypes, { image: string; text: string }>> = {
    airdrop: { image: new URL('./airdrop.png', import.meta.url).toString(), text: 'Airdrop' },
    encryptedmsg: { image: new URL('./encryptedmsg.png', import.meta.url).toString(), text: 'Encrypted message' },
    files: { image: new URL('./files.png', import.meta.url).toString(), text: 'File Service' },
    markets: { image: new URL('./markets.png', import.meta.url).toString(), text: 'Markets' },
    redpacket: { image: new URL('./redpacket.png', import.meta.url).toString(), text: 'Red Packet' },
    swap: { image: new URL('./swap.png', import.meta.url).toString(), text: 'Swap' },
    token: { image: new URL('./token.png', import.meta.url).toString(), text: 'Buy Cryptocurrency' },
    more: { image: new URL('./more.png', import.meta.url).toString(), text: '' },
    moreDark: { image: new URL('./more-dark.png', import.meta.url).toString(), text: '' },
    copy: { image: new URL('./copy.png', import.meta.url).toString(), text: '' },
}
