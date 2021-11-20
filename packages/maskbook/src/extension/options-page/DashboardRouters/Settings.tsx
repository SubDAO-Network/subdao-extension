import { useRef } from 'react'
import { Typography, Card, List, Paper } from '@material-ui/core'
import { makeStyles, createStyles, ThemeProvider, useTheme } from '@material-ui/core/styles'

import { SettingsUI, SettingsUIEnum, SettingsUIDummy } from '../../../components/shared-settings/useSettingsUI'
import {
    debugModeSetting,
    // disableOpenNewTabInBackgroundSettings,
    languageSettings,
    allPostReplacementSettings,
    appearanceSettings,
    // currentMaskbookChainIdSettings,
    enableGroupSharingSettings,
    launchPageSettings,
    currentSubstrateNetworkSettings,
} from '../../../settings/settings'
import { Appearance, LaunchPage, Language } from '../../../settings/types'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import SwapHorizIcon from '@material-ui/icons/SwapHoriz'
import MemoryOutlinedIcon from '@material-ui/icons/MemoryOutlined'
import ArchiveOutlinedIcon from '@material-ui/icons/ArchiveOutlined'
import UnarchiveOutlinedIcon from '@material-ui/icons/UnarchiveOutlined'
import ShareIcon from '@material-ui/icons/ShareOutlined'
import FlipToFrontIcon from '@material-ui/icons/FlipToFront'
import TabIcon from '@material-ui/icons/Tab'
import PaletteIcon from '@material-ui/icons/Palette'
import LanguageIcon from '@material-ui/icons/Language'
import WifiIcon from '@material-ui/icons/Wifi'
import LaunchIcon from '@material-ui/icons/Launch'
import DashboardRouterContainer from './Container'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardBackupDialog, DashboardRestoreDialog } from '../DashboardDialogs/Backup'
import { Flags } from '../../../utils/flags'
// import { currentDataProviderSettings, currentTradeProviderSettings } from '../../../plugins/Trader/settings'
// import { resolveDataProviderName, resolveTradeProviderName } from '../../../plugins/Trader/pipes'
// import { DataProvider, TradeProvider } from '../../../plugins/Trader/types'
// import { ChainId } from '../../../web3/types'
import { extendsTheme } from '../../../utils/theme'
import { SubstrateNetwork } from '../../../polkadot/constants'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
        card: {
            boxShadow: '0px 0px 6px 4px rgba(239, 240, 246, 0.8)',
            backgroundColor: 'transparent',
        },
        title: {
            fontWeight: 'normal',
            lineHeight: '30px',
            marginBottom: theme.spacing(1.5),
            [theme.breakpoints.down('sm')]: {
                marginBottom: 0,
            },
        },
        section: {
            padding: '26px 40px',
            margin: theme.spacing(3, 0),
            backgroundColor: 'transparent',
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(2),
            },
        },
        secondaryAction: {
            paddingRight: 90,
        },
        list: {
            [theme.breakpoints.down('sm')]: {
                marginLeft: theme.spacing(-2),
                marginRight: theme.spacing(-2),
            },
        },
        listItemRoot: {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        ListItemRootWithoutBorder: {
            paddingTop: theme.spacing(1.5),
            paddingBottom: theme.spacing(1.5),
        },
        listItemIcon: {
            color: theme.palette.text.primary,
            justifyContent: 'flex-start',
            minWidth: 'unset',
            marginLeft: 0,
            marginRight: theme.spacing(3),
            [theme.breakpoints.down('sm')]: {
                display: 'none',
            },
        },
        selectRoot: {
            backgroundColor: '#D51172',
            color: '#fff',
            '&:focus': {
                backgroundColor: '#D51172',
            },
        },
    }),
)

const settingsTheme = extendsTheme((theme) => ({
    wrapper: {
        padding: theme.spacing(0, 3),
    },
    typography: {
        body1: {
            lineHeight: 1.75,
        },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: 12,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    overflow: 'visible',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: theme.spacing(1),
                    paddingBottom: theme.spacing(1),
                },
            },
        },
    },
}))

export default function DashboardSettingsRouter() {
    const { t } = useI18N()
    const isMobile = useMatchXS()
    const langMapper = useRef((x: Language) => {
        if (x === Language.en) return t('language_en')
        if (x === Language.zh) return t('language_zh')
        return x
    }).current
    const appearanceMapper = useRef((x: Appearance) => {
        if (x === Appearance.dark) return t('settings_appearance_dark')
        if (x === Appearance.light) return t('settings_appearance_light')
        return t('settings_appearance_default')
    }).current
    const launchPageMapper = useRef((x: LaunchPage) => {
        if (x === LaunchPage.facebook) return 'Facebook'
        if (x === LaunchPage.twitter) return 'Twitter'
        return t('dashboard')
    }).current

    const classes = useStyles()

    const [backupDialog, openBackupDialog] = useModal(DashboardBackupDialog)
    const [restoreDialog, openRestoreDialog] = useModal(DashboardRestoreDialog)

    const listStyle = {
        secondaryAction: classes.secondaryAction,
        listItemRoot: classes.listItemRoot,
        listItemIcon: classes.listItemIcon,
    }
    const listStyleWithoutBorder = {
        secondaryAction: classes.secondaryAction,
        listItemRoot: classes.ListItemRootWithoutBorder,
        listItemIcon: classes.listItemIcon,
    }

    return (
        <DashboardRouterContainer title={t('settings')}>
            <ThemeProvider theme={settingsTheme}>
                <div className="wrapper">
                    <Paper component="section" className={classes.section}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('settings_title_general')}
                        </Typography>
                        <Card elevation={0} className={classes.card}>
                            <List className={classes.list} disablePadding>
                                <SettingsUIEnum
                                    SelectProps={{
                                        classes: {
                                            root: classes.selectRoot,
                                            select: classes.selectRoot,
                                        },
                                    }}
                                    classes={listStyle}
                                    enumObject={Language}
                                    getText={langMapper}
                                    value={languageSettings}
                                />
                                <SettingsUIEnum
                                    classes={listStyle}
                                    enumObject={Appearance}
                                    getText={appearanceMapper}
                                    value={appearanceSettings}
                                />
                                <SettingsUIEnum
                                    classes={listStyleWithoutBorder}
                                    enumObject={SubstrateNetwork}
                                    value={currentSubstrateNetworkSettings}
                                />
                            </List>
                        </Card>
                    </Paper>

                    {Flags.support_settings_advanced_options ? (
                        <Paper component="section" className={classes.section}>
                            <Typography className={classes.title} variant="h6" color="textPrimary">
                                {t('settings_title_advanced_options')}
                            </Typography>
                            <Card elevation={0} className={classes.card}>
                                <List className={classes.list} disablePadding>
                                    <SettingsUI classes={listStyle} value={debugModeSetting} />
                                    <SettingsUI classes={listStyle} value={allPostReplacementSettings} />
                                    <SettingsUI classes={listStyleWithoutBorder} value={enableGroupSharingSettings} />
                                </List>
                            </Card>
                        </Paper>
                    ) : null}

                    <Paper component="section" className={classes.section}>
                        <Typography className={classes.title} variant="h6" color="textPrimary">
                            {t('settings_title_database_management')}
                        </Typography>
                        <Card elevation={0} className={classes.card}>
                            <List className={classes.list} disablePadding>
                                <SettingsUIDummy
                                    classes={listStyle}
                                    primary={t('backup_database')}
                                    secondary={t('dashboard_backup_database_hint')}
                                    onClick={openBackupDialog}
                                />
                                <SettingsUIDummy
                                    classes={listStyleWithoutBorder}
                                    primary={t('restore_database')}
                                    secondary={t('dashboard_import_database_hint')}
                                    onClick={openRestoreDialog}
                                />
                            </List>
                        </Card>
                        {backupDialog}
                        {restoreDialog}
                    </Paper>
                </div>
            </ThemeProvider>
        </DashboardRouterContainer>
    )
}
