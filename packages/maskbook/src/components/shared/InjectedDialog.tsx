import {
    createStyles,
    DialogActions,
    DialogClassKey,
    DialogContent,
    DialogContentProps,
    DialogProps,
    ThemeProvider,
    Theme,
    DialogTitle,
    IconButton,
    makeStyles,
    Typography,
    useTheme,
    Dialog,
    useMediaQuery,
} from '@material-ui/core'
import { Children, cloneElement } from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import { usePortalShadowRoot } from '../../utils/shadow-root/usePortalShadowRoot'
import { mergeClasses, useStylesExtends } from '../custom-ui-helper'
import { DialogDismissIconUI } from '../InjectedComponents/DialogDismissIcon'
import { ErrorBoundary } from '@subdao/maskbook-theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { useMaskbookTheme } from '../../utils/theme'

const useStyles = makeStyles((theme) =>
    createStyles({
        dialogTitle: {
            padding: theme.spacing(1, 2),
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        dialogTitleTypography: {
            fontSize: '18px',
            marginLeft: 6,
            fontWeight: 400,
            verticalAlign: 'middle',
        },
        dialogBackdropRoot: {},
    }),
)

export type InjectedDialogClassKey =
    | DialogClassKey
    | 'dialogTitle'
    | 'dialogContent'
    | 'dialogActions'
    | 'dialogTitleTypography'
    | 'dialogCloseButton'
    | 'dialogBackdropRoot'
export interface InjectedDialogProps extends withClasses<InjectedDialogClassKey>, React.PropsWithChildren<{}> {
    open: boolean
    onClose?(): void
    title?: React.ReactChild
    DialogProps?: Partial<DialogProps>
    disableBackdropClick?: boolean
    disableArrowBack?: boolean
    theme?: Theme
}
export function InjectedDialog(props: InjectedDialogProps) {
    const classes = useStyles()
    const overwrite = activatedSocialNetworkUI.customization.componentOverwrite || {}
    const defaultTheme = useMaskbookTheme()
    props = overwrite.InjectedDialog?.props?.(props) ?? props
    const {
        dialogActions,
        dialogCloseButton,
        dialogContent,
        dialogTitle,
        dialogTitleTypography,
        dialogBackdropRoot,
        ...dialogClasses
    } = useStylesExtends(classes, props, overwrite.InjectedDialog?.classes)
    const fullScreen = useMediaQuery(useTheme().breakpoints.down('xs'))

    const { t } = useI18N()
    const actions = CopyElementWithNewProps(props.children, DialogActions, { root: dialogActions })
    const content = CopyElementWithNewProps(props.children, DialogContent, { root: dialogContent })

    return usePortalShadowRoot((container) => (
        <ThemeProvider theme={props.theme ?? defaultTheme}>
            <Dialog
                container={container}
                fullScreen={fullScreen}
                classes={dialogClasses}
                open={props.open}
                scroll="paper"
                fullWidth
                maxWidth="sm"
                disableAutoFocus
                disableEnforceFocus
                onClose={(event, reason) => {
                    if (reason === 'backdropClick' && props.disableBackdropClick) return
                    props.onClose?.()
                }}
                onBackdropClick={props.disableBackdropClick ? void 0 : props.onClose}
                BackdropProps={{
                    classes: {
                        root: dialogBackdropRoot,
                    },
                }}
                {...props.DialogProps}>
                <ErrorBoundary>
                    {props.title ? (
                        <div className={dialogTitle}>
                            <Typography className={dialogTitleTypography} display="inline" variant="h5">
                                {props.title}
                            </Typography>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                }}>
                                <IconButton
                                    classes={{ root: dialogCloseButton }}
                                    aria-label={t('post_dialog__dismiss_aria')}
                                    onClick={props.onClose}>
                                    <DialogDismissIconUI disableArrowBack={props.disableArrowBack} />
                                </IconButton>
                            </div>
                        </div>
                    ) : null}
                    {content}
                    {actions}
                </ErrorBoundary>
            </Dialog>
        </ThemeProvider>
    ))
}
function CopyElementWithNewProps<T>(
    children: React.ReactNode,
    Target: React.ComponentType<T>,
    // @ts-ignore
    extraClasses: T['classes'],
) {
    return (
        Children.map(children, (child: any) =>
            child?.type === Target
                ? cloneElement(child, {
                      classes: mergeClasses(extraClasses, child.props.classes),
                  } as DialogContentProps)
                : null,
        ) || []
    ).filter(Boolean)
}
