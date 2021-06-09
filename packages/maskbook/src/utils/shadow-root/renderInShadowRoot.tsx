import { ErrorBoundary } from '../../components/shared/ErrorBoundary'
import { applyMaskColorVars } from '@subdao/maskbook-theme'
import { appearanceSettings } from '../../settings/settings'
import { getMaskbookTheme } from '../theme'
import {
    createReactRootShadowedPartial,
    disableJSSDisconnectedWarning,
    setupPortalShadowRoot,
} from '@subdao/maskbook-shared'
import { untilDomLoaded } from '../dom'
import { Flags } from '../flags'
import { SubdaoInShadow } from './SubdaoInShadow'
if (process.env.NODE_ENV === 'development') disableJSSDisconnectedWarning()

const captureEvents: (keyof HTMLElementEventMap)[] = [
    'paste',
    'keydown',
    'keypress',
    'keyup',
    'drag',
    'dragend',
    'dragenter',
    'dragexit',
    'dragleave',
    'dragover',
    'dragstart',
    'change',
]
untilDomLoaded().then(() => {
    setupPortalShadowRoot({ mode: Flags.using_ShadowDOM_attach_mode }, captureEvents)
})

export const createReactRootShadowed = createReactRootShadowedPartial({
    preventEventPropagationList: captureEvents,
    onHeadCreate(head) {
        const themeCSSVars = head.appendChild(document.createElement('style'))
        function updateThemeVars() {
            applyMaskColorVars(themeCSSVars, getMaskbookTheme().palette.mode)
        }
        updateThemeVars()
        appearanceSettings.addListener(updateThemeVars)
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeVars)
    },
    wrapJSX(jsx) {
        return (
            <ErrorBoundary>
                <SubdaoInShadow>{jsx}</SubdaoInShadow>
            </ErrorBoundary>
        )
    },
})
