import { useCallback } from 'react'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import ErrorIcon from '@material-ui/icons/Error'
import { Button, createStyles, DialogActions, DialogContent, Link, makeStyles, Typography } from '@material-ui/core'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { ProviderIcon } from '../../../components/shared/ProviderIcon'
import { useSnackbarCallback } from '../../../extension/options-page/DashboardDialogs/Base'
import Services from '../../../extension/service'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useBlockNumber'
import { resolveLinkOnEtherscan, resolveProviderName } from '../../../web3/pipes'
import { ChainId, ProviderType } from '../../../web3/types'
import { EthereumChainChip } from '../../../web3/UI/EthereumChainChip'
import { formatPolkadotAddress } from '../formatter'
import { useWallet } from '../hooks/useWallet'
import { WalletMessages } from '../messages'
import { currentSelectedWalletProviderSettings } from '../settings'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'
import { ToolIconURLs } from '../../../resources/tool-icon'
import classNames from 'classnames'

const useStyles = makeStyles((theme) =>
    createStyles({
        content: {
            padding: theme.spacing(2, 2.5, 3),
        },
        footer: {
            fontSize: 12,
            textAlign: 'left',
            padding: theme.spacing(2),
            borderTop: `1px solid ${theme.palette.divider}`,
            justifyContent: 'flex-start',
        },
        section: {
            display: 'flex',
            alignItems: 'center',
            // '&:last-child': {
            //     paddingTop: theme.spacing(0.5),
            // },
        },
        actions: {},
        actionButton: {
            fontSize: 12,
            marginLeft: theme.spacing(1),
        },
        icon: {
            fontSize: 24,
            width: 24,
            height: 24,
            marginRight: theme.spacing(1),
        },
        title: {
            fontSize: 24,
            marginBottom: 20
        },
        tip: {
            flex: 1,
            fontSize: 14,
        },
        address: {
            fontSize: 14,
            marginRight: theme.spacing(1),
        },
        link: {
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.text.secondary,
            fontSize: 14,
            marginRight: theme.spacing(2),
        },
        linkIcon: {
            marginRight: theme.spacing(1),
        },
        addressItem: {
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#F4F4FA',
            padding: `${theme.spacing(1)} ${theme.spacing(1.25)}`,
            borderRadius: 4,
            paddingTop: theme.spacing(1),
            width: 303,
        },
        wallet: {
            justifyContent: 'space-between',
            marginTop: 8,
        },
    }),
)

export interface WalletStatusDialogProps {}

export function WalletStatusDialog(props: WalletStatusDialogProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const selectedWallet = useWallet()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLDivElement>) => {
            ev.stopPropagation()
            copyToClipboard(selectedWallet?.address ?? '')
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_wallet_addr'),
    )
    //#endregion

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region change provider
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    //#endregion

    //#region walletconnect
    const [, setWalletConnectDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    // render in dashboard
    useBlurContext(open)

    const onDisconnect = useCallback(async () => {
        if (selectedWalletProvider !== ProviderType.WalletConnect) return
        setOpen({
            open: false,
        })
        setWalletConnectDialogOpen({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [selectedWalletProvider, setOpen, setWalletConnectDialogOpen])
    const onChange = useCallback(() => {
        setOpen({
            open: false,
        })
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setOpen, setSelectProviderDialogOpen])

    if (!selectedWallet) return null

    return (
        <InjectedDialog title={" "} open={open} onClose={onClose} DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <Typography className={classes.title} color="textPrimary" variant="h5">
                    {t('wallet_status_title')}
                </Typography>
                <section className={classes.section}>
                    <Typography className={classes.tip} color="textSecondary">
                        {t('wallet_status_connect_with', { provider: resolveProviderName(selectedWalletProvider) })}
                    </Typography>
                </section>
                {/* 地址 */}
                <section className={classNames(classes.section, classes.wallet)}>
                    <section className={classes.addressItem}>
                        <ProviderIcon
                            classes={{ icon: classes.icon }}
                            size={14}
                            providerType={selectedWalletProvider}
                        />
                        <Typography className={classes.address}>
                            {formatPolkadotAddress(selectedWallet.address, 12)}
                        </Typography>
                        <img src={ToolIconURLs.copy.image} onClick={onCopy} style={{ cursor: 'pointer' }} alt="" />
                    </section>
                    {/* {chainIdValid && chainId !== ChainId.Mainnet ? (
                        <EthereumChainChip chainId={chainId} ChipProps={{ variant: 'outlined' }} />
                    ) : null} */}
                    <section className={classes.actions}>
                        {selectedWalletProvider === ProviderType.WalletConnect ? (
                            <Button
                                className={classes.actionButton}
                                color="primary"
                                size="medium"
                                variant="contained"
                                onClick={onDisconnect}>
                                {t('wallet_status_button_disconnect')}
                            </Button>
                        ) : null}
                        <Button
                            className={classes.actionButton}
                            color="primary"
                            size="medium"
                            variant="contained"
                            onClick={onChange}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </section>
                </section>
            </DialogContent>
            {!chainIdValid ? (
                <DialogActions className={classes.footer}>
                    <ErrorIcon color="secondary" fontSize="small" />
                    <Typography color="secondary" variant="body2">
                        {t('plugin_wallet_wrong_network_tip')}
                    </Typography>
                </DialogActions>
            ) : null}
        </InjectedDialog>
    )
}
