export type LogoIconTypes = 'subdao' | 'logo'
export const LogoIconURLs: Readonly<Record<LogoIconTypes, { image: string; text: string }>> = {
    subdao: { image: new URL('./subdao-logo.png', import.meta.url).toString(), text: 'SubDAO' },
    logo: { image: new URL('./logo.png', import.meta.url).toString(), text: 'logo' },
}
