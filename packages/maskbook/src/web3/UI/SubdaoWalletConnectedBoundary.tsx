import { createStyles, Grid, makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../utils/i18n-next-ui'
import { useAccount } from '../hooks/useAccount'
import { useChainIdValid } from '../hooks/useBlockNumber'
import { useSubdaoTokenBalance } from '../hooks/useSubdaoTokenBalance'

const useStyles = makeStyles((theme) =>
    createStyles({
        button: {
            marginTop: theme.spacing(1.5),
        },
        grid: {
            justifyContent: 'flex-end',
        },
    }),
)

export interface SubdaoWalletConnectedBoundaryProps {
    children?: React.ReactNode
}

export function SubdaoWalletConnectedBoundary(props: SubdaoWalletConnectedBoundaryProps) {
    const { children = null } = props

    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const { value: subdaoBalance = '0', error: subdaoBalanceError, retry: retrySubdaoBalance } = useSubdaoTokenBalance(
        account,
    )

    //#region remote controlled select provider dialog
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    if (!account)
        return (
            <Grid container className={classes.grid}>
                <ActionButton className={classes.button} fullWidth variant="contained" size="large" onClick={onConnect}>
                    {t('plugin_wallet_connect_a_wallet')}
                </ActionButton>
            </Grid>
        )
    if (subdaoBalance === null || new BigNumber(subdaoBalance).isZero())
        return (
            <Grid container className={classes.grid}>
                <ActionButton
                    color="primary"
                    className={classes.button}
                    disabled={!subdaoBalanceError}
                    variant="contained"
                    size="large"
                    onClick={retrySubdaoBalance}>
                    {t('plugin_wallet_no_gas_fee')}
                </ActionButton>
            </Grid>
        )

    if (!chainIdValid)
        return (
            <Grid container className={classes.grid}>
                <ActionButton className={classes.button} disabled fullWidth variant="contained" size="large">
                    {t('plugin_wallet_invalid_network')}
                </ActionButton>
            </Grid>
        )
    return <Grid container>{children}</Grid>
}
