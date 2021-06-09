import { Typography, IconButton, MenuItem, ListItem, ListItemTypeMap } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import type { DaoInfo } from '../../../polkadot/hooks/useDaoPartners'
import { Avatar } from '../../../utils/components/Avatar'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactDialog, DashboardContactDeleteConfirmDialog } from '../DashboardDialogs/Contact'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { DefaultComponentProps } from '@material-ui/core/OverridableComponent'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            padding: theme.spacing(2),
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        avatar: {
            width: '32px',
            height: '32px',
            backgroundColor: 'white !important',
        },
        user: {
            color: theme.palette.text.primary,
            fontWeight: 500,
            margin: theme.spacing(0, 2),
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        provider: {
            color: theme.palette.text.secondary,
            marginRight: theme.spacing(2),
            [theme.breakpoints.down('sm')]: {
                flex: 1,
            },
        },
        fingerprint: {
            color: theme.palette.text.secondary,
            marginLeft: 'auto',
            marginRight: 0,
            fontFamily: 'var(--monospace)',
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
        },
        more: {
            marginLeft: theme.spacing(1),
            color: theme.palette.text.primary,
        },
    }),
)

interface DaoLineProps extends Partial<DefaultComponentProps<ListItemTypeMap<{ button: true }, 'div'>>> {
    daoInfo: DaoInfo
}

export function DaoLine(props: DaoLineProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const xsMatched = useMatchXS()
    const { daoInfo, ...rest } = props
    const person = {
        avatar: daoInfo.logo,
        nickname: daoInfo.name,
        identifier: {
            toText: () => 'ffffff',
        },
    }
    return (
        <>
            <ListItem button selected={false} className={classes.line} {...rest}>
                <Avatar className={classes.avatar} person={person} />
                <Typography className={classes.user}>{daoInfo.name}</Typography>
                {xsMatched ? null : (
                    <Typography className={classes.fingerprint} component="code">
                        {daoInfo.desc}
                    </Typography>
                )}
            </ListItem>
        </>
    )
}
