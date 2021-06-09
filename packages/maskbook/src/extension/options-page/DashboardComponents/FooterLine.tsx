import { makeStyles, createStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Breadcrumbs, Theme, Typography, Link as MuiLink } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { DashboardAboutDialog } from '../DashboardDialogs/About'
import { useModal } from '../DashboardDialogs/Base'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        footerButtons: {
            '& ol': {
                justifyContent: 'center',
            },
        },
        footerButton: {
            borderRadius: '0',
            whiteSpace: 'nowrap',
            '& > p': {
                fontSize: 12,
            },
        },
    }),
)

type FooterLinkBaseProps = { title?: string }
type FooterLinkLinkProps = FooterLinkBaseProps & { to: string }
type FooterLinkAnchorProps = FooterLinkBaseProps & { href: string }
type FooterLinkAnchorButtonProps = FooterLinkBaseProps & { onClick(e: React.MouseEvent<HTMLAnchorElement>): void }

type FooterLinkProps = FooterLinkLinkProps | FooterLinkAnchorProps | FooterLinkAnchorButtonProps

const FooterLink = function (props: React.PropsWithChildren<FooterLinkProps>) {
    const classes = useStyles()
    const children = <Typography variant="body2">{props.children}</Typography>
    if ('href' in props)
        return (
            <MuiLink
                underline="none"
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                color="textPrimary"
                className={classes.footerButton}>
                {children}
            </MuiLink>
        )
    if ('to' in props)
        return (
            <MuiLink underline="none" {...props} component={Link} color="textPrimary" className={classes.footerButton}>
                {children}
            </MuiLink>
        )
    return (
        <MuiLink
            underline="none"
            {...props}
            component="a"
            style={{ cursor: 'pointer' }}
            color="textPrimary"
            className={classes.footerButton}>
            {children}
        </MuiLink>
    )
}

export default function FooterLine() {
    const { t } = useI18N()
    const classes = useStyles()
    const [aboutDialog, openAboutDialog] = useModal(DashboardAboutDialog)
    const version = globalThis.browser?.runtime.getManifest()?.version ?? process.env.TAG_NAME.slice(1)
    const openVersionLink = (event: React.MouseEvent) => {
        // `MouseEvent.prototype.metaKey` on macOS (`Command` key), Windows (`Windows` key), Linux (`Super` key)
        if (process.env.build === 'stable' && event.metaKey === false) {
            open(t('version_of_release', { tag: `v${version}` }))
        } else {
            open(t('version_of_hash', { hash: process.env.COMMIT_HASH }))
        }
    }
    return (
        <>
            <Breadcrumbs className={classes.footerButtons} separator="-" aria-label="breadcrumb">
                <FooterLink href="https://subdao.network">subdao.network</FooterLink>
            </Breadcrumbs>
            {aboutDialog}
        </>
    )
}
