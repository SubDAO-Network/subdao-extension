import { cloneElement } from 'react'
import {
    makeStyles,
    createStyles,
    Typography,
    Divider,
    experimentalStyled as styled,
    Fade,
    Fab,
    CircularProgress,
    PropTypes,
} from '@material-ui/core'
import classNames from 'classnames'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import { Flags } from '../../../utils/flags'

interface DashboardRouterContainerProps {
    title?: string
    children: React.ReactNode
    /**
     * add or remove the space between divider and left panel
     */
    padded?: boolean
    /**
     * add or remove the placeholder
     */
    empty?: boolean
    emptyText?: string
    /**
     * add or remove the padding of scroller
     */
    compact?: boolean

    navHeight?: number

    /**
     * (mobile only)
     * fab on the right bottom position of page
     */
    floatingButtons?: { icon: React.ReactElement; handler: () => void }[]

    /**
     * (pc only)
     * buttons on the right of title
     */
    actions?: React.ReactElement[]
}

const FAB_COLORS: PropTypes.Color[] = ['primary', 'secondary', 'default']

const useStyles = makeStyles((theme) => {
    return createStyles<string, { isSetup: boolean; navHeight: number }>({
        wrapper: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: `0 ${theme.typography.pxToRem(70)}`,
            // [theme.breakpoints.up('sm')]: {
            //     display: Flags.has_native_nav_bar ? 'inline' : 'grid',
            //     gridTemplateRows: (props) => (props.isSetup ? '1fr' : '[titleAction] 0fr [divider] 0fr [content] auto'),
            // },
            [theme.breakpoints.down('sm')]: {
                padding: `0 ${theme.typography.pxToRem(20)}`,
            },
        },
        placeholder: {
            top: (props) => theme.typography.pxToRem(props.navHeight),
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            marginTop: 20,
        },
        scroller: {
            height: '100%',
            width: '100%',
            position: 'absolute',
            left: 0,
            top: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            overflow: 'auto',
        },
        scrollerCompact: {
            paddingLeft: '0 !important',
            paddingRight: '0 !important',
        },
        title: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 110,
            padding: `${theme.spacing(7.5)} 0 ${theme.spacing(4)} 0`,
        },
        titleContent: {
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: 32,
            lineHeight: 1.2,
            [theme.breakpoints.down('sm')]: {
                color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
                left: 0,
                right: 0,
                pointerEvents: 'none',
                position: 'absolute',
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.2,
                textAlign: 'center',
                marginBottom: 0,
            },
        },
        FloatingIcon: {
            color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
            padding: theme.spacing(1),
            fontSize: '2.5rem',
        },
        titlePlaceholder: {
            flex: 1,
        },
        content: {
            flex: 1,
            position: 'relative',
            borderRadius: 10,
            [theme.breakpoints.down('sm')]: {
                height: '100vh',
            },
        },
        contentPadded: {
            '& > *': {
                overflow: 'auto',
                padding: theme.spacing(0, 3),
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
                [theme.breakpoints.down('sm')]: {
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                },
            },
        },
        divider: {
            borderColor: theme.palette.divider,
            [theme.breakpoints.down('sm')]: {
                display: theme.palette.mode === 'light' ? 'none' : 'block',
            },
        },
        dividerPadded: {
            padding: theme.spacing(0, 3),
            [theme.breakpoints.down('sm')]: {
                padding: theme.spacing(0, 2),
            },
        },
        dividerCompact: {
            padding: '0 !important',
        },
        buttons: {
            display: 'flex',
            '& > *': {
                margin: theme.spacing(0, 1),
            },
        },
        floatButtonContainer: {
            position: 'fixed',
            bottom: theme.spacing(1),
            right: theme.spacing(2),
        },
        floatingButton: {
            display: 'flex',
            justifyItems: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing(2),
        },
    })
})

export default function DashboardRouterContainer(props: DashboardRouterContainerProps) {
    const {
        title,
        actions,
        children,
        padded,
        navHeight = 0,
        empty,
        emptyText,
        compact = false,
        floatingButtons = [],
    } = props
    const isSetup = location.hash.includes('/setup')
    const classes = useStyles({
        isSetup,
        navHeight,
    })
    const xsMatched = useMatchXS()

    return (
        <Fade in>
            <section className={classes.wrapper}>
                {isSetup ? null : (
                    <>
                        {Flags.has_native_nav_bar ? null : (
                            <>
                                <section className={classes.title}>
                                    <Typography className={classes.titleContent} color="textPrimary" variant="h6">
                                        {title}
                                    </Typography>

                                    {Flags.has_native_nav_bar ? null : (
                                        <div className={classes.buttons}>
                                            {actions?.map((action, index) => cloneElement(action, { key: index }))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}
                <div className={classNames(classes.content)}>
                    <div className={classNames(classes.scroller, { [classes.scrollerCompact]: compact !== false })}>
                        {children}
                    </div>
                    {empty ? (
                        <div className={classes.placeholder}>
                            <img alt="" src={new URL('./dashboard-placeholder.png', import.meta.url).toString()} />
                            {emptyText ? (
                                <Typography className={classes.emptyText} color="textPrimary">
                                    {emptyText}
                                </Typography>
                            ) : null}
                        </div>
                    ) : null}
                </div>
                <div className={classes.floatButtonContainer}>
                    {Flags.has_native_nav_bar
                        ? floatingButtons?.map((floatingButton, index) => (
                              <Fab
                                  color={FAB_COLORS[index]}
                                  className={classes.floatingButton}
                                  onClick={floatingButton.handler}>
                                  {cloneElement(floatingButton.icon, {
                                      key: index,
                                      className: classes.FloatingIcon,
                                  })}
                              </Fab>
                          ))
                        : null}
                </div>
            </section>
        </Fade>
    )
}

export interface BareProps {
    children?: React.ReactNode
    loading: boolean
}
const LoadingContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: ${theme.spacing(2.5)};
    padding: ${theme.spacing(2.5)};
`,
)
export const ContainerLoading = (props: BareProps): React.ReactElement => {
    const { loading, children } = props
    if (loading)
        return (
            <LoadingContainer>
                <CircularProgress color="primary" variant="indeterminate" />
            </LoadingContainer>
        )

    return <>{children}</>
}
