import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { ToolbarAtTwitter, TOOLBAR_HEIGHT } from '../../../components/InjectedComponents/ToolbarAtTwitter'
import { ToolbarPlaceholder } from '../../../components/InjectedComponents/ToolbarPlaceholder'
import { startWatch } from '../../../utils/watcher'
import { twitterUrl } from '../utils/url'

const mainSelector = () => new LiveSelector().querySelector('body > noscript')
const menuSelector = () => new LiveSelector().querySelector('[role="banner"] [role="heading"]')

export function injectToolboxHintAtTwitter(signal: AbortSignal) {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return

    // inject placeholder into left column
    const menuWatcher = new MutationObserverWatcher(menuSelector())
    startWatch(menuWatcher, signal)
    createReactRootShadowed(menuWatcher.firstDOMProxy.beforeShadow, { signal }).render(
        <ToolbarPlaceholder expectedHeight={TOOLBAR_HEIGHT} />,
    )

    // inject toolbar
    const mainWatcher = new MutationObserverWatcher(mainSelector())
    startWatch(mainWatcher, signal)
    createReactRootShadowed(mainWatcher.firstDOMProxy.beforeShadow, { signal }).render(<ToolbarAtTwitter />)
}
