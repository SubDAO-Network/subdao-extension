export type IconsTypes = 'feedback' | 'delete'
export const IconsURLs: Readonly<Record<IconsTypes, { image: string; text: string }>> = {
    feedback: { image: new URL('./feedback.png', import.meta.url).toString(), text: 'feedback' },
    delete: { image: new URL('./delete.png', import.meta.url).toString(), text: 'delete' },
}
