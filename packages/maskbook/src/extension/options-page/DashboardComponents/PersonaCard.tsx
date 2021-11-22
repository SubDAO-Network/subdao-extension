import { useEffect } from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import type { Persona } from '../../../database'
import { MenuItem, Card, IconButton } from '@material-ui/core'
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined'
import Services from '../../service'
import { useColorStyles } from '../../../utils/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import ProfileBox from './ProfileBox'
import type { ProfileIdentifier } from '../../../database/type'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardPersonaRenameDialog,
    DashboardPersonaBackupDialog,
    DashboardPersonaDeleteConfirmDialog,
} from '../DashboardDialogs/Persona'
import { useMenu } from '../../../utils/hooks/useMenu'
import { ToolIconURLs } from '../../../resources/tool-icon'

interface Props {
    persona: Persona
}

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            width: 'calc(50% - 10px)',
            height: 160,
            marginBottom: 10,
            '&:nth-child(2n)': {
                marginLeft: theme.spacing(1.25),
            },
            '&:nth-child(2n-1)': {
                marginRight: theme.spacing(1.25),
            },
            padding: '17px 7px 17px 20px',
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#F8F8FB',
            borderRadius: 12,
            border: theme.palette.mode === 'dark' ? 'none' : '1px solid #E7EAF3',
            boxShadow: 'none',
            [theme.breakpoints.down('sm')]: {
                flex: 'none',
                width: '100%',
                marginRight: '0 !important',
                marginLeft: '0 !important',
                marginBottom: 10,
            },
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: theme.spacing(3),
        },
        title: {
            flex: '1 1 auto',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all',
            whiteSpace: 'nowrap',
            fontWeight: 500,
        },
        menu: {
            flex: '0 0 auto',
            cursor: 'pointer',
            display: theme.palette.mode === 'dark' ? 'none' : 'block',
        },
        menuDark: {
            flex: '0 0 auto',
            cursor: 'pointer',
            display: theme.palette.mode === 'dark' ? 'block' : 'none',
        },
        profile: {
            paddingRight: 10,
        },
        more: {
            backgroundColor: '',
        },
    }),
)

export default function PersonaCard({ persona }: Props) {
    const { t } = useI18N()
    const classes = useStyles()
    const color = useColorStyles()

    const [deletePersona, openDeletePersona] = useModal(DashboardPersonaDeleteConfirmDialog, { persona })
    const [backupPersona, openBackupPersona] = useModal(DashboardPersonaBackupDialog, { persona })
    const [renamePersona, openRenamePersona] = useModal(DashboardPersonaRenameDialog, { persona })

    const [menu, openMenu] = useMenu([
        <MenuItem onClick={openRenamePersona}>{t('rename')}</MenuItem>,
        <MenuItem onClick={openBackupPersona}>{t('backup')}</MenuItem>,
        <MenuItem onClick={openDeletePersona} className={color.error} data-testid="delete_button">
            {t('delete')}
        </MenuItem>,
    ])

    const id = persona.linkedProfiles.keys().next().value as ProfileIdentifier | undefined

    useEffect(() => {
        if (persona.nickname) return
        const profile = id
        if (!profile) Services.Identity.renamePersona(persona.identifier, persona.identifier.compressedPoint)
        else
            Services.Identity.queryProfile(profile)
                .then((profile) => profile.nickname || profile.identifier.userId)
                .then((newName) => Services.Identity.renamePersona(persona.identifier, newName))
    }, [persona.identifier, id, persona.nickname])

    return (
        <Card className={classes.card} elevation={2}>
            <Typography className={classes.header} variant="h5" component="h2">
                <>
                    <span title={persona.nickname} className={classes.title} data-testid="persona_title">
                        {persona.nickname}
                    </span>
                    {/* <IconButton size="small" className={classes.menu} classes={{root: classes.more}} onClick={openMenu} data-testid="setting_icon">
                        <MoreHorizOutlinedIcon />
                    </IconButton> */}
                    <img
                        src={ToolIconURLs.more.image}
                        className={classes.menu}
                        width={48}
                        alt=""
                        onClick={openMenu}
                        data-testid="setting_icon"
                    />
                    <img
                        src={ToolIconURLs.more.image}
                        className={classes.menuDark}
                        width={48}
                        alt=""
                        onClick={openMenu}
                        data-testid="setting_icon"
                    />
                    {menu}
                </>
            </Typography>
            <div className={classes.profile}>
                <ProfileBox persona={persona} />
            </div>
            {deletePersona}
            {backupPersona}
            {renamePersona}
        </Card>
    )
}
