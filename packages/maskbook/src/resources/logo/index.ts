export type LogoIconTypes = 'subdao'
export const LogoIconURLs: Readonly<Record<LogoIconTypes, { image: string; text: string }>> = {
    subdao: { image: new URL('./subdao-logo.png', import.meta.url).toString(), text: 'SubDAO' },
}
