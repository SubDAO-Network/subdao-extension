export type IconsTypes =
    | 'feedback'
    | 'delete'
    | 'rightArrow'
    | 'persona'
    | 'profiles'
    | 'posts'
    | 'Groups'
    | 'wallets'
    | 'user'
    | 'search'
    | 'file'
    | 'Twitter'
    | 'TwitterActive'
export const IconsURLs: Readonly<Record<IconsTypes, { image: string; text: string }>> = {
    feedback: { image: new URL('./feedback.png', import.meta.url).toString(), text: 'feedback' },
    delete: { image: new URL('./delete.png', import.meta.url).toString(), text: 'delete' },
    rightArrow: { image: new URL('./rightArrow.png', import.meta.url).toString(), text: 'rightArrow' },
    persona: { image: new URL('./persona.png', import.meta.url).toString(), text: 'persona' },
    profiles: { image: new URL('./profiles.png', import.meta.url).toString(), text: 'profiles' },
    posts: { image: new URL('./posts.png', import.meta.url).toString(), text: 'posts' },
    Groups: { image: new URL('./Groups.png', import.meta.url).toString(), text: 'Groups' },
    wallets: { image: new URL('./wallets.png', import.meta.url).toString(), text: 'wallets' },
    user: { image: new URL('./user.png', import.meta.url).toString(), text: 'user' },
    search: { image: new URL('./search.png', import.meta.url).toString(), text: 'search' },
    file: { image: new URL('./file.png', import.meta.url).toString(), text: 'file' },
    Twitter: { image: new URL('./Twitter.png', import.meta.url).toString(), text: 'Twitter' },
    TwitterActive: { image: new URL('./TwitterActive.png', import.meta.url).toString(), text: 'TwitterActive' },
}