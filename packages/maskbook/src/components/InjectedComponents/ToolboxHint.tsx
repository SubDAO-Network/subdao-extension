import { makeStyles, Typography, MenuItem } from '@material-ui/core'
import { MaskbookSharpIconOfSize, WalletSharp } from '../../resources/MaskbookIcon'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { useMenu } from '../../utils/hooks/useMenu'
import { useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { RedPacketCompositionEntry } from '../../plugins/RedPacket/define'
import { useAccount } from '../../web3/hooks/useAccount'
import { useRemoteControlledDialog, useRemoteControlledDialogEvent } from '../../utils/hooks/useRemoteControlledDialog'
import { Flags } from '../../utils/flags'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ProviderIcon } from '../shared/ProviderIcon'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { formatPolkadotAddress } from '../../plugins/Wallet/formatter'
import { useChainId } from '../../web3/hooks/useBlockNumber'
import { ChainId } from '../../web3/types'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { resolveChainColor } from '../../web3/pipes'

const useStyles = makeStyles((theme) => ({
    paper: {
        borderRadius: 4,
        transform: 'translateY(-150px) !important',
        boxShadow: `${
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
        }`,
    },
    menu: {
        paddingTop: 0,
        paddingBottom: 0,
    },

    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        cursor: 'pointer',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(0px)',
        },
        '&:hover': {
            '& $title': {
                color: theme.palette.primary.main,
            },
            '& $icon': {
                color: theme.palette.primary.main,
            },
        },
    },
    button: {
        display: 'flex',
        padding: '12px 26px 12px 14px',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(0px)',
            padding: 14,
        },
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        lineHeight: 1.35,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    menuItem: {},
    text: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        marginLeft: 22,
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 24,
        height: 24,
        fontSize: 24,
    },
    mask: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 22,
        height: 22,
        fontSize: 22,
    },
    chainIcon: {
        fontSize: 18,
        width: 18,
        height: 18,
        marginLeft: theme.spacing(0.5),
    },
}))

interface ToolboxHintProps extends withClasses<never> {}
export function ToolboxHint(props: ToolboxHintProps) {
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainId = useChainId()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true }),
        [],
    )
    //#endregion

    //#region Wallet
    const { onOpen: onSelectWalletDialogOpen } = useRemoteControlledDialogEvent(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const { onOpen: onSelectProviderDialogOpen } = useRemoteControlledDialogEvent(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const openWallet = useCallback(() => {
        if (selectedWallet) {
            onSelectWalletDialogOpen()
        } else {
            onSelectProviderDialogOpen()
        }
    }, [])
    //#endregion

    //#region Red packet
    const openRedPacket = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            RedPacketCompositionEntry.onClick()
        })
    }, [openEncryptedMessage])
    //#endregion

    const [menu, openMenu] = useMenu(
        [
            <MenuItem onClick={openEncryptedMessage} className={classes.menuItem}>
                <Image src={ToolIconURLs.encryptedmsg.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.encryptedmsg.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={openRedPacket} className={classes.menuItem}>
                <Image src={ToolIconURLs.redpacket.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.redpacket.text}</Typography>
            </MenuItem>,
        ],
        false,
        {
            paperProps: {
                className: classNames(classes.paper),
            },
            menuListProps: {
                className: classNames(classes.menu),
            },
        },
    )

    return (
        <>
            <div className={classes.wrapper} onClick={openMenu}>
                <div className={classes.button}>
                    <MaskbookSharpIconOfSize classes={{ root: classes.icon }} size={22} />
                    <Typography className={classes.title}>SubDAO</Typography>
                </div>
            </div>
            {menu}

            <div className={classes.wrapper} onClick={openWallet}>
                <div className={classes.button}>
                    {selectedWallet ? (
                        <ProviderIcon
                            classes={{ icon: classes.icon }}
                            size={24}
                            providerType={selectedWalletProvider}
                        />
                    ) : (
                        <WalletSharp classes={{ root: classes.icon }} size={24} />
                    )}

                    <Typography className={classes.title}>
                        {account ? formatPolkadotAddress(account, 4) : 'Connect Wallet'}
                        {chainId !== ChainId.Mainnet && selectedWallet ? (
                            <FiberManualRecordIcon
                                className={classes.chainIcon}
                                style={{
                                    color: resolveChainColor(chainId),
                                }}
                            />
                        ) : null}
                    </Typography>
                </div>
            </div>
        </>
    )
}
