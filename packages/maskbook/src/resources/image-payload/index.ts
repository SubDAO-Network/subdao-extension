export type ImageTemplateTypes = 'v1' | 'v2' | 'v3' | 'v4' | 'eth' | 'dai' | 'okb'
export const ImagePayloadURLs: Readonly<Record<ImageTemplateTypes, string>> = {
    v1: new URL('./normal/payload-v1.jpeg', import.meta.url).toString(),
    v2: new URL('./normal/payload-v2.jpeg', import.meta.url).toString(),
    v3: new URL('./normal/payload-v3.jpeg', import.meta.url).toString(),
    v4: new URL('./normal/payload-v4.jpeg', import.meta.url).toString(),
    okb: new URL('./normal/payload-v1.jpeg', import.meta.url).toString(),
    dai: new URL('./normal/payload-v1.jpeg', import.meta.url).toString(),
    eth: new URL('./normal/payload-v1.jpeg', import.meta.url).toString(),
}
