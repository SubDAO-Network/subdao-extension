import { forwardRef, useCallback, useState } from 'react'
import { Button, Box, IconButton, MenuItem, Tabs, Tab } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined'
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
            color: theme.palette.primary.main,
        },
        moreButton: {
            color: theme.palette.text.primary,
        },
        assetsTable: {
            flex: 1,
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
        <MenuItem onClick={() => openWalletDelete({ wallet })} className={color.error} data-testid="delete_button">
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
                            className={classes.addButton}
                            variant="text"
                            onClick={() => openAddToken({ wallet })}
                            startIcon={<AddIcon />}>
                            {t('add_token')}
                        </Button>
                    ) : null}
                    <IconButton
                        className={classes.moreButton}
                        size="small"
                        onClick={openMenu}
                        data-testid="setting_icon">
                        <MoreVertOutlinedIcon />
                    </IconButton>
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
