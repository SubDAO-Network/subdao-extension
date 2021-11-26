import { Fragment } from 'react'
import classNames from 'classnames'
import { List, ListItem, ListItemIcon, ListItemText, Typography, Box, Divider } from '@material-ui/core'
import { createStyles, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import { Link, useRouteMatch } from 'react-router-dom'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { TelegramIcon } from '@subdao/icons'
import { useModal } from '../DashboardDialogs/Base'
import { useI18N } from '../../../utils/i18n-next-ui'
import Logo from './MaskbookLogo'
import { Carousel } from './Carousel'
import { makeNewBugIssueURL } from '../../debug-page/issue'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { extendsTheme } from '../../../utils/theme'
import { LogoIconURLs } from '../../../resources/logo'
import { IconsURLs } from '../../../resources/icons'
import { Image } from '../../../components/shared/Image'

const useStyles = makeStyles((theme) => {
    const activeColor = theme.palette.mode === 'dark' ? 'white' : '#D51172'

    return {
        drawer: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            gridTemplateRows: '[drawerHeader] 0fr [drawerList] auto [drawerFooter] 0fr',
            overflow: 'visible',
            position: 'relative',
            [theme.breakpoints.down('sm')]: {
                color: theme.palette.text.primary,
                width: '100%',
            },
            backgroundColor: 'var(--drawerHeader)',
            padding: `${theme.typography.pxToRem(16)} ${theme.typography.pxToRem(70)}`,
            borderRadius: 10,
        },
        drawerHeader: {
            display: 'flex',
            marginTop: 8,
        },
        drawerHeaderText: {
            marginLeft: 10,
            lineHeight: '40px',
        },
        drawerBody: {
            display: 'flex',
            flexDirection: 'row',
        },
        drawerList: {
            padding: 0,
            display: 'flex',
        },
        drawerItem: {
            borderLeft: 'solid 5px var(--drawerBody)',
            paddingTop: 16,
            paddingBottom: 16,
            [theme.breakpoints.down('sm')]: {
                borderLeft: 'none',
                padding: theme.spacing(3, 0),
            },
            '&.Mui-selected': {
                '& span': {
                    color: activeColor,
                    fontWeight: 400,
                },
                backgroundColor: 'transparent',
            },
            '&:hover': {
                backgroundColor: 'transparent!important',
            },
        },
        activeDrawer: {
            color: activeColor,
        },
        drawerItemText: {
            margin: 0,
            fontWeight: 500,
        },
        drawerItemTextPrimary: {
            color: theme.palette.mode === 'dark' ? '#9094AF' : '#10164B',
            [theme.breakpoints.down('sm')]: {
                fontSize: 16,
            },
        },
        drawerFeedback: {
            borderLeft: 'none',
            color: '#9094AF',
            marginLeft: 90,
        },
        slogan: {
            color: theme.palette.mode === 'light' ? '#A1C1FA' : '#3B3B3B',
            opacity: 0.5,
            width: 316,
            height: 260,
            left: 48,
            bottom: 30,
            fontWeight: 'bold',
            fontSize: 40,
            lineHeight: 1.2,
            letterSpacing: -0.4,
            position: 'absolute',
            transitionDuration: '2s',
        },
    }
})

const drawerTheme = extendsTheme((theme) => ({
    components: {
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&$selected$selected': {
                        borderLeftColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.light : 'var(--drawerBody)',
                        backgroundColor:
                            theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    color: 'unset',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontSize: 14,
                    lineHeight: '24px',
                    fontWeight: 500,
                },
            },
        },
    },
}))

interface DrawerProps {
    routers: readonly (readonly [string, string, JSX.Element])[]
    exitDashboard: null | (() => void)
}

export default function Drawer(props: DrawerProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const match = useRouteMatch('/:param/')
    const forSetupPurpose = match?.url.includes('/setup')
    const xsMatched = useMatchXS()
    const activeUrl = ''

    const { routers } = props

    const activeMenuClass = (routers: readonly (readonly [string, string, JSX.Element])[]) => {
        return routers.map((o: readonly [string, string, JSX.Element]) => ({
            className: location?.hash?.includes(o[1]) ? classes.activeDrawer : '',
        }))
    }
    const menusClasses = activeMenuClass(routers)

    const onDebugPage = (event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else if (event.altKey) {
            browser.tabs.create({
                active: true,
                url: makeNewBugIssueURL(),
            })
        }
    }

    return (
        <ThemeProvider theme={drawerTheme}>
            <nav className={classes.drawer}>
                {xsMatched ? null : (
                    <Box
                        onClick={onDebugPage}
                        className={classes.drawerHeader}
                        style={{ backgroundColor: `var(--drawerBody)` }}>
                        <Image src={LogoIconURLs.subdao.image} width={40} height={40} />
                        <Typography className={classes.drawerHeaderText} color="textPrimary">
                            SubDAO
                        </Typography>
                    </Box>
                )}
                <Box className={classes.drawerBody}>
                    {forSetupPurpose ? null : (
                        <>
                            <List className={classes.drawerList}>
                                {routers.map((item, index) => (
                                    <Fragment key={index}>
                                        <ListItem
                                            className={classes.drawerItem}
                                            selected={match ? item[1].startsWith(match.url) : false}
                                            component={Link}
                                            to={item[1]}
                                            disableRipple={true}
                                            button>
                                            <ListItemText
                                                className={classes.drawerItemText}
                                                primary={item[0]}
                                                primaryTypographyProps={{ className: classes.drawerItemTextPrimary }}
                                            />
                                        </ListItem>
                                        {/* {xsMatched ? <Divider /> : null} */}
                                    </Fragment>
                                ))}
                            </List>
                            <List className={classes.drawerList}>
                                <ListItem
                                    className={classNames(classes.drawerItem, classes.drawerFeedback)}
                                    button
                                    onClick={() => {
                                        const url = new URL(t('feedback_address'))
                                        window.open(url.toString())
                                    }}>
                                    <img src={IconsURLs.feedback.image} style={{ marginRight: 10 }} width={20} alt="" />

                                    <ListItemText
                                        className={classes.drawerItemText}
                                        primary={t('feedback')}
                                        primaryTypographyProps={{ className: classes.drawerItemTextPrimary }}
                                    />
                                    {xsMatched ? (
                                        <ListItemIcon>
                                            <ChevronRightIcon color="action" />
                                        </ListItemIcon>
                                    ) : null}
                                </ListItem>
                                {xsMatched ? <Divider /> : null}
                            </List>
                        </>
                    )}
                </Box>
            </nav>
        </ThemeProvider>
    )
}
