import { useState } from 'react'
import { Appearance } from '../../../settings/types'
import { getMaskbookTheme } from '../../../utils/theme'
import { isDarkTheme } from '../../../utils/theme-tools'
export function useThemeFacebook() {
    const [theme, setTheme] = useState(getTheme())
    const updateTheme = () => setTheme(getTheme())
    return theme
}

function getTheme() {
    return getMaskbookTheme({ appearance: isDarkTheme() ? Appearance.dark : Appearance.light })
}
