import { makeStyles, Theme, Typography, Link } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'

const useStyle = makeStyles((theme: Theme) => ({
    text: {
        fontSize: 'inherit',
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
    },
}))

export interface PayloadReplacerProps {
    payload: string
}

export function PayloadReplacer({ payload }: PayloadReplacerProps) {
    const { t } = useI18N()
    const classes = useStyle()
    return (
        <Typography className={classes.text} color="textPrimary" component="span" variant="body1">
            <Link
                href={
                    /^https?:\/\/(wwww)?subdao(\.network|book\.network)/i.test(payload)
                        ? payload
                        : 'https://www.subdao.network'
                }>
                {t('post_substitute_label')}
            </Link>
        </Typography>
    )
}
