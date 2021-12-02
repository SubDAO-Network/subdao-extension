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
import { Link } from 'react-router-dom'
import { DashboardRoute } from '../Route'

const useStyles = makeStyles((theme) =>
    createStyles({
        item: {
            padding: 0,
            height: 104,
            '&:hover': {
                background: 'none',
            },
        },
        line: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: 90,
            padding: '25px 33px 25px 30px',
            background: 'rgba(241, 242, 248, 0.5)',
            borderRadius: 12,
            border: '1px solid #E7EAF3',
            textDecorationLine: 'none',
        },
        content: {
            flex: 1,
        },
        avatar: {
            width: '40px',
            height: '40px',
            backgroundColor: 'white !important',
            marginRight: 10,
        },
        user: {
            color: theme.palette.text.primary,
            flex: '0 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 300,
        },
        provider: {
            color: theme.palette.text.secondary,
            marginRight: theme.spacing(2),
            [theme.breakpoints.down('sm')]: {
                flex: 1,
            },
        },
        fingerprint: {
            color: 'rgba(16, 22, 75, 0.7)',
            marginLeft: 'auto',
            marginRight: 0,
            display: '-webkit-box',
            '-webkit-line-clamp': 2,
            '-webkit-box-orient': 'vertical',
            overflow: 'hidden',
            fontSize: 14,
            fontWeight: 300,
            lineHeight: '16px',
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
        address: daoInfo.address,
    }
    return (
        <>
            <ListItem button selected={false} {...rest} classes={{ root: classes.item }}>
                <Link to={`${DashboardRoute.Dao}/${person.address}`} className={classes.line}>
                    <Avatar className={classes.avatar} person={person} />
                    <div className={classes.content}>
                        <Typography className={classes.user}>{daoInfo.name}</Typography>
                        <Typography className={classes.fingerprint} component="code">
                            {daoInfo.desc}
                        </Typography>
                    </div>
                </Link>
            </ListItem>
        </>
    )
}
