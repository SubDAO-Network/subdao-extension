import { cloneElement, forwardRef, useCallback, useReducer } from 'react'
import classNames from 'classnames'
import {
    DialogProps,
    Dialog,
    Fade,
    IconButton,
    createStyles,
    makeStyles,
    DialogContent,
    Typography,
    FadeProps,
    SvgIconProps,
    IconButtonProps,
} from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'
import type { TransitionProps } from '@material-ui/core/transitions'
import { useBlurContext } from '../DashboardContexts/BlurContext'
import { useSnackbar } from 'notistack'
import { useI18N } from '../../../utils/i18n-next-ui'
import { extendsTheme, useMaskbookTheme } from '../../../utils/theme'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

const Transition = forwardRef<unknown, TransitionProps & Pick<FadeProps, 'children'>>(function Transition(props, ref) {
    return <Fade ref={ref} {...props} />
})

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            userSelect: 'none',
            backgroundColor: 'rgba(17, 18, 30, 0.4)',
        },
        close: {
            color: theme.palette.text.primary,
            position: 'absolute',
            right: 10,
            top: 10,
        },
    }),
)

export interface DashboardDialogCoreProps extends DialogProps {
    CloseIconProps?: Partial<SvgIconProps>
    CloseButtonProps?: Partial<IconButtonProps>
    ComponentProps?: any
    width?: string | number
}

export function DashboardDialogCore(props: DashboardDialogCoreProps) {
    const { fullScreen, children, ComponentProps, CloseIconProps, CloseButtonProps, ...dialogProps } = props

    const classes = useStyles()
    const xsMatched = useMatchXS()
    // useBlurContext(dialogProps.open)

    return (
        <Dialog
            className={classes.root}
            closeAfterTransition
            fullScreen={fullScreen ?? xsMatched}
            TransitionComponent={Transition}
            hideBackdrop
            {...dialogProps}>
            {children}
            <IconButton
                className={classes.close}
                onClick={(e) => dialogProps.onClose?.(e, 'backdropClick')}
                size="small"
                {...CloseButtonProps}>
                <CloseIcon {...CloseIconProps} />
            </IconButton>
        </Dialog>
    )
}

export interface WrappedDialogProps<T extends object = any> extends DialogProps {
    ComponentProps?: T
    onClose(): void
}
enum DialogState {
    Opened = 1,
    Closing,
    Destroyed,
}

type useModalState<Props extends object> = { state: DialogState; props?: Props }
type useModalActions<Props extends object> = { type: 'open' | 'close' | 'destroy'; props?: Props }
function reducer<Props extends object>(
    state: useModalState<Props>,
    action: useModalActions<Props>,
): useModalState<Props> {
    if (action.type === 'open') return { state: DialogState.Opened, props: action.props }
    if (action.type === 'close') return { state: DialogState.Closing, props: state.props }
    return { state: DialogState.Destroyed }
}

export function useModal<DialogProps extends object, AdditionalPropsAppendByDispatch extends Partial<DialogProps>>(
    Modal: React.FunctionComponent<WrappedDialogProps<DialogProps>>,
    ComponentProps?: DialogProps,
): [React.ReactNode, () => void, (props: AdditionalPropsAppendByDispatch) => void] {
    const [status, dispatch] = useReducer(reducer, { state: DialogState.Destroyed })
    const showModal = useCallback(() => dispatch({ type: 'open' }), [])
    const showStatefulModal = useCallback(
        (props?: AdditionalPropsAppendByDispatch) => dispatch({ type: 'open', props }),
        [],
    )
    // TODO: prevent onClose on some cases (e.g, click away while loading)
    const onClose = useCallback(() => dispatch({ type: 'close' }), [])
    const onExited = useCallback(() => dispatch({ type: 'destroy' }), [])
    const { state, props } = status

    const compositeProps =
        ComponentProps || props ? { ComponentProps: { ...ComponentProps, ...props } as DialogProps } : {}

    const modalProps: WrappedDialogProps<DialogProps> = {
        TransitionProps: { onExited },
        ...compositeProps,
        open: state === DialogState.Opened,
        onClose,
    }
    const theme = useMaskbookTheme()
    const renderedComponent =
        state === DialogState.Destroyed ? null : (
            <ThemeProvider theme={theme}>
                <Modal {...modalProps} />
            </ThemeProvider>
        )

    return [renderedComponent, showModal, showStatefulModal]
}

const getWrapperWidth = (size: string = '') => {
    switch (size) {
        case 'small':
            return 280
        default:
            break
    }
    return 450
}

const useDashboardDialogWrapperStyles = makeStyles((theme) =>
    createStyles<string, DashboardDialogWrapperProps>({
        wrapper: {
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: (props) => getWrapperWidth(props.size),
            padding: (props) => (props.size === 'small' ? '40px 24px !important' : '40px 22px !important'),
            margin: '0 auto',
        },
        header: {
            textAlign: 'left',
            paddingTop: 22,
        },
        content: {
            flex: 1,
            textAlign: 'center',
        },
        footer: {
            display: 'flex',
            marginTop: theme.spacing(3),
            justifyContent: 'flex-end',
        },
        center: {
            textAlign: 'right',
            justifyContent: 'space-around',
        },
        primary: {
            margin: theme.spacing(2, 0, 1),
            fontWeight: 500,
            fontSize: 24,
            lineHeight: '30px',
        },
        secondary: {
            lineHeight: '21px',
            fontSize: 18,
            textAlign: 'left',
            wordBreak: 'break-word',
            marginBottom: 18,
            padding: 0,
        },
        paddingSecondary: {
            paddingLeft: 32,
            fontSize: 14,
        },
        confineSecondary: {
            // paddingLeft: (props) => (props.size === 'small' ? 24 : 46),
            // paddingRight: (props) => (props.size === 'small' ? 24 : 46),
        },
    }),
)

const dialogTheme = extendsTheme((theme) => ({
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                input: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
                multiline: {
                    paddingTop: 14.5,
                    paddingBottom: 14.5,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                outlined: {
                    transform: 'translate(14px, 16px) scale(1)',
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    marginTop: theme.spacing(2),
                },
                inputRoot: {
                    paddingTop: '5px !important',
                    paddingBottom: '5px !important',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginTop: theme.spacing(2),
                    marginBottom: 0,

                    '&:first-child': {
                        marginTop: 0,
                    },
                },
            },
            defaultProps: {
                fullWidth: true,
                variant: 'outlined',
                margin: 'normal',
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    '&[hidden]': {
                        visibility: 'hidden',
                    },
                },
            },
            defaultProps: { size: 'medium' },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                },
                indicator: {
                    height: 1,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                    borderBottom: `solid 1px ${theme.palette.divider}`,
                },
            },
        },
    },
}))

interface DashboardDialogWrapperProps {
    icon?: React.ReactElement
    iconColor?: string
    primary: string
    secondary?: string
    constraintSecondary?: boolean
    size?: 'small' | 'medium' | 'large'
    content?: React.ReactNode
    footer?: React.ReactNode
    layout?: 'center'
}

export function DashboardDialogWrapper(props: DashboardDialogWrapperProps) {
    const { size, icon, iconColor, primary, secondary, constraintSecondary = true, content, footer, layout } = props
    const classes = useDashboardDialogWrapperStyles(props)
    return (
        <ThemeProvider theme={dialogTheme}>
            <DialogContent className={classes.wrapper}>
                <section className={classes.header}>
                    <Typography className={classes.primary} variant="h5">
                        {icon && cloneElement(icon, { width: 24, height: 24, stroke: iconColor })}
                        <span style={icon ? { marginLeft: 8 } : {}}>{primary}</span>
                    </Typography>
                    <Typography
                        className={classNames(
                            classes.secondary,
                            size !== 'small' && constraintSecondary ? classes.confineSecondary : '',
                            icon ? classes.paddingSecondary : '',
                        )}
                        color="textSecondary"
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: secondary ?? '' }}></Typography>
                </section>
                {content ? <section className={classes.content}>{content}</section> : null}
                {footer ? (
                    <section className={classNames(classes.footer, layout === 'center' ? classes.center : null)}>
                        {footer}
                    </section>
                ) : null}
            </DialogContent>
        </ThemeProvider>
    )
}

export function useSnackbarCallback<P extends (...args: any[]) => Promise<T>, T>(
    executor: P,
    deps: React.DependencyList,
    onSuccess?: (ret: T) => void,
    onError?: (err: Error) => void,
    key?: string,
    successText?: string,
) {
    const { t } = useI18N()
    const { enqueueSnackbar } = useSnackbar()
    return useCallback(
        (...args) =>
            executor(...args).then(
                (res) => {
                    enqueueSnackbar(successText ?? t('done'), { key, variant: 'success', preventDuplicate: true })
                    onSuccess?.(res)
                    return res
                },
                (err) => {
                    enqueueSnackbar(`Error: ${err.message || err}`, { key, preventDuplicate: true })
                    onError?.(err)
                    throw err
                },
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...deps, enqueueSnackbar, executor, key, onError, onSuccess, t],
    )
}
