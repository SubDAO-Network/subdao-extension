export type WalletIconTypes = 'delete' | 'transfer'
export const WalletIconURLs: Readonly<Record<WalletIconTypes, { image: string; text: string }>> = {
    delete: { image: new URL('./delete.png', import.meta.url).toString(), text: 'delete' },
    transfer: { image: new URL('./transfer.png', import.meta.url).toString(), text: 'transfer' },
}
