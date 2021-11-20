export type IconsTypes = 'feedback'
export const IconsURLs: Readonly<Record<IconsTypes, { image: string; text: string }>> = {
    feedback: { image: new URL('./feedback.png', import.meta.url).toString(), text: 'feedback' },
}
