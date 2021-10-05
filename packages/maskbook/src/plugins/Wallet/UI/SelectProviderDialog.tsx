import { useCallback } from 'react'
import { MoreHorizontal } from 'react-feather'
import {
    makeStyles,
    Theme,
    createStyles,
    DialogContent,
    ImageList,
    ImageListItem,
    Typography,
    Link,
    DialogActions,
} from '@material-ui/core'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { useHistory } from 'react-router-dom'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { Provider } from './Provider'
import { MetaMaskIcon } from '../../../resources/MetaMaskIcon'
// import { MaskbookIcon } from '../../../resources/MaskbookIcon'

import { SubDAOIcon } from '../../../resources/MaskbookIcon'
import { PolkadotIcon } from '../../../resources/PolkadotIcon'
import { KusamaIcon } from '../../../resources/KusamaIcon'

// import { WalletConnectIcon } from '../../../resources/WalletConnectIcon'
import Services from '../../../extension/service'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { WalletMessages } from '../messages'
import { useBlurContext } from '../../../extension/options-page/DashboardContexts/BlurContext'
import { DashboardRoute } from '../../../extension/options-page/Route'
import { ProviderType } from '../../../web3/types'
import { unreachable } from '../../../utils/utils'
import { Flags } from '../../../utils/flags'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useWallets } from '../hooks/useWallet'
import { SubstrateNetwork } from '../../../polkadot/constants'

import { createGlobalSettings } from '../../../settings/createSettings'
import { MaskMessage } from '../../../utils/messages'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            width: '750px !important',
            maxWidth: 'unset',
        },
        content: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden',
            padding: theme.spacing(4, 2),
        },
        grid: {
            width: '100%',
        },
        icon: {
            fontSize: 45,
        },
        tip: {
            fontSize: 12,
        },
    }),
)

interface SelectProviderDialogUIProps extends withClasses<never> {}

function SelectProviderDialogUI(props: SelectProviderDialogUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const history = useHistory()

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    //#region select wallet dialog
    const [, selectWalletDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectWalletDialogUpdated)
    //#endregion

    //#region wallet connect QR code dialog
    const [_, setWalletConnectDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    // render in dashboard
    useBlurContext(open)

    const wallets = useWallets(ProviderType.SubDAO)
    const onConnect = useCallback(
        async (providerType: ProviderType) => {
            onClose()
            switch (providerType) {
                case ProviderType.SubDAO:
                case ProviderType.Polkadot:
                case ProviderType.Kusama:
                    // const id = Date.now()
                    // console.log(`SubstrateNetwork....`, SubstrateNetwork[providerType])

                    currentSubstrateNetworkSettings.value = SubstrateNetwork[providerType]
                    // MaskMessage.events.createInternalSettingsChanged.sendToAll({
                    //     id,
                    //     key: 'settings+SubstrateNetwork',
                    //     value: SubstrateNetwork[providerType],
                    //     initial: true,
                    // })

                    if (wallets.length > 0) {
                        selectWalletDialogOpen({
                            open: true,
                        })
                        return
                    }

                    if (isEnvironment(Environment.ManifestOptions))
                        history.push(`${DashboardRoute.Wallets}?create=${Date.now()}`)
                    else await Services.Welcome.openOptionsPage(DashboardRoute.Wallets, `create=${Date.now()}`)
                    break
                case ProviderType.MetaMask:
                    await Services.Ethereum.connectMetaMask()
                    break
                case ProviderType.WalletConnect:
                    setWalletConnectDialogOpen({
                        open: true,
                        uri: await Services.Ethereum.createConnectionURI(),
                    })
                    break
                default:
                    unreachable(providerType)
            }
        },
        [wallets, history, onClose, selectWalletDialogOpen, setWalletConnectDialogOpen],
    )

    return (
        <InjectedDialog title={t('plugin_wallet_select_provider_dialog_title')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <ImageList className={classes.grid} gap={16} rowHeight={183}>
                    <ImageListItem>
                        <Provider
                            logo={<SubDAOIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="SubDAO"
                            description={t('plugin_wallet_connect_to_subdao')}
                            onClick={() => onConnect(ProviderType.SubDAO)}
                        />
                    </ImageListItem>
                    <ImageListItem>
                        <Provider
                            logo={<PolkadotIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="Polkadot"
                            description={t('plugin_wallet_connect_to_polkadot')}
                            onClick={() => onConnect(ProviderType.Polkadot)}
                        />
                    </ImageListItem>
                    <ImageListItem>
                        <Provider
                            logo={<KusamaIcon className={classes.icon} viewBox="0 0 45 45" />}
                            name="Kusama"
                            description={t('plugin_wallet_connect_to_kusama')}
                            onClick={() => onConnect(ProviderType.Kusama)}
                        />
                    </ImageListItem>
                    {Flags.metamask_support_enabled ? (
                        <ImageListItem>
                            <Provider
                                logo={<MetaMaskIcon className={classes.icon} viewBox="0 0 45 45" />}
                                name="MetaMask"
                                description={t('plugin_wallet_connect_to_metamask')}
                                onClick={() => onConnect(ProviderType.MetaMask)}
                            />
                        </ImageListItem>
                    ) : null}
                </ImageList>
            </DialogContent>
            <DialogActions></DialogActions>
        </InjectedDialog>
    )
}

export interface SelectProviderDialogProps extends SelectProviderDialogUIProps {}

export function SelectProviderDialog(props: SelectProviderDialogProps) {
    return <SelectProviderDialogUI {...props} />
}
