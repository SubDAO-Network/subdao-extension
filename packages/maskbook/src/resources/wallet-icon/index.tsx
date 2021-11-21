export type WalletIconTypes = 'delete' | 'transfer' | 'deleteDark' | 'transferDark'
export const WalletIconURLs: Readonly<Record<WalletIconTypes, { image: string; text: string }>> = {
    delete: { image: new URL('./delete.png', import.meta.url).toString(), text: 'delete' },
    deleteDark: { image: new URL('./delete-dark.png', import.meta.url).toString(), text: 'delete' },
    transfer: { image: new URL('./transfer.png', import.meta.url).toString(), text: 'transfer' },
    transferDark: { image: new URL('./transfer-dark.png', import.meta.url).toString(), text: 'transfer' },
}
