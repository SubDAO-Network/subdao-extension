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
            height: 36,
            width: 36,
            marginTop: 6,
            borderRadius: 8,
            cursor: 'pointer',
        },
        assetsTable: {
            flex: 1,
        },
        menuItem: {
            color: theme.palette.text.secondary,
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

    const [menu, openMenu] = useMenu([
        <MenuItem onClick={() => openWalletRename({ wallet })}>{t('rename')}</MenuItem>,
        wallet._private_key_ || wallet.mnemonic.length ? (
            <MenuItem onClick={() => openWalletBackup({ wallet })}>{t('backup')}</MenuItem>
        ) : null,
        <MenuItem onClick={() => openWalletDelete({ wallet })} className={classes.menuItem} data-testid="delete_button">
            {t('delete')}
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
                        <Tab label={t('dashboard_tab_token')}></Tab>
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
