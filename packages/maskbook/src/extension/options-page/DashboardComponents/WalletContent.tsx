import { forwardRef, useCallback, useState } from 'react'
import { Button, Box, IconButton, MenuItem, Tabs, Tab } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined'
import { useModal } from '../DashboardDialogs/Base'
import {
    DashboardWalletHistoryDialog,
    DashboardWalletBackupDialog,
    DashboardWalletDeleteConfirmDialog,
    DashboardWalletAddERC20TokenDialog,
    DashboardWalletRenameDialog,
    DashboardWalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useColorStyles } from '../../../utils/theme'
import { useMatchXS } from '../../../utils/hooks/useMatchXS'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { WalletAssetsTable } from './WalletAssetsTable'
import { useSubstrate } from '../../../polkadot/provider'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { SubstrateNetwork } from '../../../polkadot/constants'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { experimentalStyled as styled } from '@material-ui/core'

const TabBg = styled(Tab)`
    min-width: auto !important;
    color: #10164b !important;
    font-size: 18px !important;
    font-weight: 400 !important;
`

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            '&> *': {
                flex: '0 0 auto',
                overflow: 'auto',
            },
        },
        alert: {
            marginTop: theme.spacing(2),
        },
        caption: {
            padding: theme.spacing(2, 0),
        },
        header: {
            borderBottom: `1px solid ${theme.palette.divider}`,
        },
        content: {
            flex: 1,
        },
        footer: {
            margin: theme.spacing(1),
        },
        title: {
            flex: 1,
            paddingLeft: theme.spacing(1),
        },
        tabs: {},
        addButton: {
            borderRadius: 8,
            backgroundColor: '#5C5F85',
            '&:hover': {
                backgroundColor: '#5C5F85',
            },
            color: '#FFFFFF',
        },
        moreButton: {
            backgroundColor: 'rgba(247, 147, 0, 0.6)',
            color: '#FFFFFF',
            marginLeft: 10,
            height: 18,
            width: 18,
            padding: 9,
            boxSizing: 'content-box',
            marginTop: 6,
            borderRadius: 8,
            cursor: 'pointer',
        },
        assetsTable: {
            flex: 1,
        },
        menuItem: {
            color: '#5C5F85',
            margin: '0 6px',
            '& span:first-child': {
                margin: '0 auto',
            },
        },
    }),
)

interface WalletContentProps {
    wallet: WalletRecord
}

export const WalletContent = forwardRef<HTMLDivElement, WalletContentProps>(function WalletContent(
    { wallet }: WalletContentProps,
    ref,
) {
    const classes = useStyles()
    const { t } = useI18N()
    const color = useColorStyles()
    const xsMatched = useMatchXS()
    const [walletHistory, , openWalletHistory] = useModal(DashboardWalletHistoryDialog)
    const [walletBackup, , openWalletBackup] = useModal(DashboardWalletBackupDialog)
    const [walletDelete, , openWalletDelete] = useModal(DashboardWalletDeleteConfirmDialog)
    const [addToken, , openAddToken] = useModal(DashboardWalletAddERC20TokenDialog)
    const [walletRename, , openWalletRename] = useModal(DashboardWalletRenameDialog)
    const [walletRedPacket, , openWalletRedPacket] = useModal(DashboardWalletRedPacketDetailDialog)

    const { state, dispatch } = useSubstrate()
    const network = useValueRef(currentSubstrateNetworkSettings)

    const [menu, openMenu] = useMenu([
        <MenuItem onClick={() => openWalletRename({ wallet })} className={classes.menuItem}>
            <span>{t('rename')}</span>
        </MenuItem>,
        wallet._private_key_ || wallet.mnemonic.length ? (
            <MenuItem onClick={() => openWalletBackup({ wallet })} className={classes.menuItem}>
                <span>{t('backup')}</span>
            </MenuItem>
        ) : null,
        <MenuItem onClick={() => openWalletDelete({ wallet })} className={classes.menuItem} data-testid="delete_button">
            <span>{t('delete')}</span>
        </MenuItem>,
    ])

    //#region tab
    const [tabIndex, setTabIndex] = useState(0)
    const onTabChange = useCallback((_, newTabIndex: number) => {
        setTabIndex(newTabIndex)
    }, [])
    //#endregion

    return (
        <div className={classes.root} ref={ref}>
            <Box
                className={classes.caption}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                    <Tabs
                        className={classes.tabs}
                        value={tabIndex}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={onTabChange}>
                        <TabBg label={t('dashboard_tab_token')}></TabBg>
                    </Tabs>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                    }}>
                    {!xsMatched && tabIndex === 0 ? (
                        <Button
                            classes={{ root: classes.addButton }}
                            variant="contained"
                            size="medium"
                            disabled={network !== SubstrateNetwork.SubDAO}
                            onClick={() => openAddToken({ wallet })}
                            startIcon={<AddIcon />}>
                            {t('add_token')}
                        </Button>
                    ) : null}
                    {/* <Button
                        classes={{root: classes.moreButton}}
                        variant="contained"
                        size="medium"
                        onClick={openMenu}
                        startIcon={<MoreHorizOutlinedIcon />}>
                    </Button> */}
                    <div onClick={openMenu}>
                        <MoreHorizOutlinedIcon classes={{ root: classes.moreButton }} />
                    </div>

                    {/* <IconButton
                        className={classes.moreButton}
                        size="small"
                        onClick={openMenu}
                        data-testid="setting_icon">
                        <MoreHorizOutlinedIcon />
                    </IconButton> */}
                </Box>
            </Box>

            {menu}

            <Box className={classes.content}>
                {tabIndex === 0 ? (
                    <WalletAssetsTable
                        classes={{ container: classes.assetsTable }}
                        wallet={wallet}
                        state={state}
                        dispatch={dispatch}
                    />
                ) : null}
            </Box>

            {addToken}
            {walletHistory}
            {walletBackup}
            {walletDelete}
            {walletRename}
            {walletRedPacket}
        </div>
    )
})
