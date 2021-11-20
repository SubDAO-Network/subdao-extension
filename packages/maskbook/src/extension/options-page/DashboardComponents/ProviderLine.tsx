import { Typography, IconButton, Link, Button } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import { capitalize } from 'lodash-es'
import { useI18N } from '../../../utils/i18n-next-ui'

import LinkOffIcon from '@material-ui/icons/LinkOff'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { facebookDomain } from '../../../social-network-adaptor/facebook.com/utils/isMobile'
import { twitterDomain } from '../../../social-network-adaptor/twitter.com/utils/isMobile'
import { Flags } from '../../../utils/flags'

const useStyles = makeStyles((theme) =>
    createStyles<string, { border: boolean }>({
        title: {
            fontWeight: 500,
            fontSize: 12,
            lineHeight: 1.75,
            marginBottom: 8,
        },
        text: {
            fontSize: 14,
            lineHeight: '24px',
            borderWidth: (props) => (props.border ? '2px' : '0 0 1px 0'),
            borderColor: 'rgba(213, 17, 114, 0.2)',
            borderStyle: 'solid',
            borderRadius: 8,
            backgroundColor: '#FFF3F9',
            display: 'flex',
            alignItems: 'center',
            padding: theme.spacing(1, 2),
            '& > :first-child': {
                flex: '1 1 auto',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            },
            '& > :last-child': {
                flex: '0 0 auto',
            },
        },
        cursor: {
            cursor: 'pointer',
        },
        control: {
            marginBottom: theme.spacing(2),
        },
        simpleControl: {},
        simpleText: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        simpleTitle: {
            marginBottom: 0,
        },
        linkButton: {
            backgroundColor: '#FFFFFF',
        },
    }),
)

export interface ProviderLineProps extends withClasses<never> {
    internalName: string
    network: string
    connected?: boolean
    userId?: string
    border: boolean
    onAction?: () => void
}

export default function ProviderLine(props: ProviderLineProps) {
    const { t } = useI18N()
    // TODO: internal name should not be used to display
    const { internalName, network, connected, userId, onAction, border } = props
    const classes = useStyles({ border })
    return border ? (
        <div className={classes.control}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                {capitalize(internalName)}
            </Typography>
            <Typography
                className={classNames(classes.text, { [classes.cursor]: !connected })}
                color={connected ? 'textPrimary' : 'primary'}
                variant="body1"
                component="div"
                onClick={connected ? undefined : onAction}
                data-testid={`connect_button_${network.toLowerCase()}`}>
                {connected ? (
                    Flags.has_no_connected_user_link ? (
                        <span>{userId}</span>
                    ) : (
                        Goto(network, userId)
                    )
                ) : (
                    <span>{`${t('connect_to')} ${network}`}</span>
                )}
                {connected ? (
                    <IconButton size="small" onClick={onAction} className={classes.cursor}>
                        <LinkOffIcon />
                    </IconButton>
                ) : (
                    <IconButton size="small">
                        <ArrowForwardIcon color="primary" />
                    </IconButton>
                )}
            </Typography>
        </div>
    ) : (
        <div className={classes.simpleControl}>
            <Typography
                className={classNames(classes.title, classes.simpleTitle)}
                variant="body2"
                color="textSecondary">
                {capitalize(internalName)}
            </Typography>
            <Typography
                className={classNames(classes.simpleText)}
                color="textPrimary"
                variant="body1"
                component="div"
                data-testid={`connect_button_${network.toLowerCase()}`}>
                {connected ? <span>{userId}</span> : <span>{`${t('connect_to')} ${network}`}</span>}
                {connected ? (
                    <Button className={classes.linkButton} variant="outlined" onClick={onAction}>
                        {t('personas_disconnect')}
                    </Button>
                ) : (
                    <Button className={classes.linkButton} variant="outlined" onClick={onAction}>
                        {t('personas_connect')}
                    </Button>
                )}
            </Typography>
        </div>
    )
}
function Goto(network: string, userID?: string) {
    const title = '@' + userID
    const props = {
        title,
        children: title,
        color: 'textPrimary',
        style: { textDecoration: 'underline' } as React.CSSProperties,
    } as const
    // TODO: should use getHomePage URL I guess?
    if (network === 'facebook.com') return <Link href={facebookDomain} {...props} />
    if (network === 'twitter.com') return <Link href={twitterDomain} {...props} />
    return <span title={title}>{title}</span>
}
