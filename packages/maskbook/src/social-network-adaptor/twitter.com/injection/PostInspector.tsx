import type { PostInfo } from '../../../social-network/PostInfo'
import { injectPostInspectorDefault } from '../../../social-network/defaults/inject/PostInspector'
import { twitterEncoding } from '../encoding'

export function injectPostInspectorAtTwitter(signal: AbortSignal, current: PostInfo) {
    return injectPostInspectorDefault({
        zipPost(node) {
            const contentContainer = node.current.parentElement
            if (!contentContainer) return

            const content = contentContainer.querySelector<HTMLDivElement>('[lang]')
            if (!content) return

            for (const a of content.querySelectorAll('a')) {
                if (twitterEncoding.payloadDecoder(a.title)) hideDOM(a)
                if (/^https?:\/\/www\.subdao\.network$/i.test(a.title)) hideDOM(a)
            }
            for (const span of content.querySelectorAll('span')) {
                // match (.) (\n) (—§—) (any space) (/*)
                // Note: In Chinese we can't hide dom because "解密这条推文。\n—§—" is in the same DOM
                // hide it will break the sentence.
                if (span.innerText.match(/^\.\n—§— +\/\* $/)) hideDOM(span)
                // match (any space) (*/) (any space)
                if (span.innerText.match(/^ +\*\/ ?$/)) hideDOM(span)
            }

            const parent = content.parentElement?.nextElementSibling as HTMLElement
            if (parent && matches(parent.innerText)) {
                parent.style.height = '0'
                parent.style.overflow = 'hidden'
            }

            // card wrapper on profile page
            const cardWrapper = contentContainer?.parentElement?.querySelector<HTMLDivElement>(
                '[data-testid="card.wrapper"]',
            )
            if (cardWrapper) {
                const parent = cardWrapper.parentElement?.parentElement
                if (parent) {
                    parent.style.display = 'none'
                }
            }

            const cardWrapperOnDetailPage = contentContainer?.parentElement?.parentElement?.querySelector<HTMLDivElement>(
                '[data-testid="card.wrapper"]',
            )
            if (cardWrapperOnDetailPage) {
                const parent = cardWrapperOnDetailPage.parentElement?.parentElement
                if (parent) {
                    parent.style.display = 'none'
                }
            }
        },
    })(current, signal)
}
function matches(input: string) {
    return /subdao\.network/i.test(input) && /Make Privacy Protected Again/i.test(input)
}

function hideDOM(a: HTMLElement) {
    a.style.width = '0'
    a.style.height = '0'
    a.style.overflow = 'hidden'
    a.style.display = 'inline-block'
}
