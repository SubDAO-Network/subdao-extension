export type IconsTypes = 'feedback' | 'delete' | 'rightArrow'
export const IconsURLs: Readonly<Record<IconsTypes, { image: string; text: string }>> = {
    feedback: { image: new URL('./feedback.png', import.meta.url).toString(), text: 'feedback' },
    delete: { image: new URL('./delete.png', import.meta.url).toString(), text: 'delete' },
    rightArrow: { image: new URL('./rightArrow.png', import.meta.url).toString(), text: 'rightArrow' },
}
