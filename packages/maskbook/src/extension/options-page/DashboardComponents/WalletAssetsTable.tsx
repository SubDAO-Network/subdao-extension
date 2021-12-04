import React, { useEffect, useMemo } from 'react'
import {
    List,
    ListItem,
    Box,
    Button,
    IconButton,
    makeStyles,
    Skeleton,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Collapse,
    MenuItem,
    Typography,
} from '@material-ui/core'
import { createStyles } from '@material-ui/core/styles'
import { useCopyToClipboard } from 'react-use'
import classNames from 'classnames'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { useSnackbar } from 'notistack'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { formatPolkadotAddress } from '../../../plugins/Wallet/formatter'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import { TokenIcon } from './TokenIcon'
import { useContext, useState } from 'react'
import { DashboardWalletsContext } from '../DashboardRouters/Wallets'
import { DashboardWalletTransferDialog } from './TransferDialog'
import { useModal } from '../DashboardDialogs/Base'
import { Send as SendIcon } from 'react-feather'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { DeriveBalancesAll } from '@polkadot/api-derive/types'

import FormatBalance from '../../../polkadot/components/FormatBalance'
import { PolkadotTransactionStateType as StateType } from '../../../polkadot/hooks/useTransactionState'
import { ActionType } from '../../../polkadot/types'
import { useToggle } from '../../../utils/hooks/useToogle'

import { WalletRPC } from '../../../plugins/Wallet/messages'
import { useERC20TokensFromDB } from '../../../plugins/Wallet/hooks/useERC20Token'
import { useERC20TokenBalance } from '../../../polkadot/hooks/useERC20TokenBalance'
import { useMenu } from '../../../utils/hooks/useMenu'
import { useColorStyles } from '../../../utils/theme'
import { formatBalance } from '@polkadot/util'
import { useSnackbarCallback } from '../DashboardDialogs/Base'
import { WalletIconURLs } from '../../../resources/wallet-icon'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { SubstrateNetwork } from '../../../polkadot/constants'

import { experimentalStyled as styled } from '@material-ui/core'

const TokenIconBg = styled(Box)`
    display: flex;
    align-items: center;
`
const TypographyBG = styled(Typography)`
    color: #bec0d2;
`

const circleIcon = <CircularProgress color="inherit" size={12} />
const sendIcon = <SendIcon size={12} />

const useStyles = makeStyles((theme: Theme) => {
    const dark = theme.palette.mode == 'dark'
    return createStyles({
        container: {
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            padding: theme.spacing(0),
        },
        table: {},
        actionCell: {
            minWidth: '10rem',
            flex: 2,
        },
        head: {
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.common.white : 'var(--drawerBody)',
            padding: `${theme.spacing(1.25)} ${theme.spacing(3.75)}`,
        },
        cell: {
            // paddingLeft: theme.spacing(2),
            // paddingRight: theme.spacing(1.5),
            whiteSpace: 'nowrap',
            borderBottom: 'none',
            textAlign: 'left',
            // flex: 3,
            fontWeight: 300,
            '&:first-child': {
                width: 400,
            },
        },
        row: {
            display: 'flex',
            borderRadius: 12,
            background: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(241, 242, 248, 0.5)',
            border: `1px solid ${dark ? '#1F2452' : '#E7EAF3'}`,
            padding: `${theme.spacing(3)} ${theme.spacing(3.75)}`,
            marginBottom: 15,
        },
        record: {
            display: 'flex',
        },
        coin: {
            width: 40,
            height: 40,
        },
        name: {
            marginLeft: theme.spacing(1),
        },
        balanceMore: {
            marginLeft: theme.spacing(0.5),
        },
        balanceName: {
            minWidth: '15rem',
            '& .ui--FormatBalance-value': {
                fontSize: '22px !important',
            },
            '& .ui--FormatBalance-postfix': {
                fontSize: 14,
            },
            '& .ui--FormatBalance-unit': {
                fontSize: 14,
            },
        },
        actionButton: {
            '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: 'white',
            },
        },
        more: {
            color: theme.palette.text.primary,
        },
        lessButton: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(1),
        },
        cellButton: {
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            '&:first-child': {
                marginRight: theme.spacing(3),
            },
        },
        cellIcon: {
            marginRight: 8,
            '& img': {
                width: 20,
                marginTop: 3,
            },
        },
        lightIcon: {
            display: dark ? 'none' : 'inline',
        },
        darkIcon: {
            display: !dark ? 'none' : 'inline',
        },
        transfer: {
            color: dark ? '' : '#62BA46',
        },
        delete: {
            color: dark ? '' : 'rgba(247, 0, 0, 0.5)',
        },
    })
})

//#region view detailed
interface ViewDetailedProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    token?: any
    balanceAll?: any
    address?: string
    wallet: WalletRecord
    isERC20?: boolean
    transferState: any
    detailedToken?: any
}

function ViewDetailed(props: ViewDetailedProps) {
    const { t } = useI18N()
    const { wallet, transferState, token, balanceAll, isERC20 = false, address = '', detailedToken = {} } = props

    const classes = useStylesExtends(useStyles(), props)
    const [isPopupOpen, togglePopupOpen] = useToggle()

    const disabledList = [StateType.WAIT_FOR_CONFIRMING, StateType.IS_IN_BLOCK]
    const btnDisabled = disabledList.includes(transferState?.type)
    const btnStartIcon = btnDisabled ? circleIcon : sendIcon
    const { value: balance, loading } = useERC20TokenBalance(isERC20 ? token?.address : null)

    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLDivElement>) => {
            ev.stopPropagation()
            copyToClipboard(token.address ?? address)
        },
        [token.address ?? address],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_token_addr'),
    )

    const tokenName = !!token.name.trim() ? token.name : token.symbol
    let balances = useMemo(() => {
        if (balance) {
            return formatBalance(String(balance), {
                forceUnit: '-',
                withUnit: token.symbol,
                decimals: token.decimals,
            })
        }
        return 0
    }, [balance, token.symbol, token.decimals])
    balances = balances !== '0' ? balances : `0 ${token.symbol}`
    const allItems: React.ReactNode[] = []
    const [transeferDialog, , openTransferDialogOpen] = useModal(DashboardWalletTransferDialog)
    const color = useColorStyles()
    const removeToken = () => {
        WalletRPC.removeERC20Token(token)
    }
    const [menu, openMenu] = useMenu([
        <MenuItem onClick={() => removeToken()} className={color.error}>
            {t('delete')}
        </MenuItem>,
    ])
    balanceAll &&
        (balanceAll as DeriveBalancesAll).availableBalance &&
        allItems.push(
            <TypographyBG key={1}>
                {t('transferrable')}
                <FormatBalance
                    className={classes.balanceMore}
                    value={(balanceAll as DeriveBalancesAll).availableBalance}
                />
            </TypographyBG>,
        )
    balanceAll?.reservedBalance?.gtn(0) &&
        allItems.push(
            <Typography key={2}>
                {t('reserved')}
                <FormatBalance className={classes.balanceMore} value={balanceAll.reservedBalance} />
            </Typography>,
        )

    return (
        <ListItem className={classes.row}>
            {[
                <TokenIconBg
                    onClick={onCopy}
                    sx={{
                        display: 'flex',
                        cursor: 'pointer',
                    }}>
                    <TokenIcon classes={{ icon: classes.coin }} name={token.name} address={address} />
                    {!isERC20 ? (
                        <Typography className={classes.name}>{`${wallet.name}(${formatPolkadotAddress(
                            address,
                            10,
                        )})`}</Typography>
                    ) : (
                        <Typography className={classes.name}>
                            {tokenName}
                            {formatPolkadotAddress(address, 10)}
                        </Typography>
                    )}
                </TokenIconBg>,
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                        textAlign: 'left',
                        flex: 1,
                    }}>
                    {!isERC20 ? (
                        <>
                            <Typography className={classes.balanceName} color="textPrimary" component="span">
                                <FormatBalance
                                    value={balanceAll && balanceAll.freeBalance.add(balanceAll.reservedBalance)}
                                />
                                {/* <IconButton color="inherit" size="small" onClick={togglePopupOpen}>
                                    {!isPopupOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                                </IconButton> */}
                            </Typography>
                            {/* <Collapse in={isPopupOpen} timeout="auto" unmountOnExit>
                                {allItems}
                            </Collapse> */}
                            <Typography color="textSecondary" component="div">
                                {allItems}
                            </Typography>
                        </>
                    ) : (
                        <Typography className={classes.balanceName} color="textPrimary" component="span">
                            {balances}
                        </Typography>
                    )}
                </Box>,
                <Box
                    className={classes.actionCell}
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                    }}>
                    {!isERC20 ? (
                        <div
                            className={classes.cellButton}
                            onClick={
                                !btnDisabled ? () => openTransferDialogOpen({ wallet, ...detailedToken }) : () => {}
                            }>
                            <div className={classes.cellIcon}>
                                <img className={classes.lightIcon} src={WalletIconURLs.transfer.image} alt="" />
                                <img className={classes.darkIcon} src={WalletIconURLs.transferDark.image} alt="" />
                            </div>
                            <Typography className={classes.transfer}>{t('wallet_transfer_title')}</Typography>
                        </div>
                    ) : (
                        <>
                            <div
                                className={classes.cellButton}
                                onClick={
                                    !btnDisabled
                                        ? () => openTransferDialogOpen({ wallet, ...detailedToken, token })
                                        : () => {}
                                }>
                                <div className={classes.cellIcon}>
                                    <img className={classes.lightIcon} src={WalletIconURLs.transfer.image} alt="" />
                                    <img className={classes.darkIcon} src={WalletIconURLs.transferDark.image} alt="" />
                                </div>
                                <Typography className={classes.transfer}>{t('wallet_transfer_title')}</Typography>
                            </div>
                            <div className={classes.cellButton} onClick={!btnDisabled ? removeToken : () => {}}>
                                <div className={classes.cellIcon}>
                                    <img className={classes.lightIcon} src={WalletIconURLs.delete.image} alt="" />
                                    <img className={classes.darkIcon} src={WalletIconURLs.deleteDark.image} alt="" />
                                </div>
                                <Typography className={classes.delete}>{t('delete')}</Typography>
                            </div>
                            {menu}
                        </>
                    )}
                </Box>,
            ]
                .filter(Boolean)
                .map((y, i) => (
                    <Box className={classes.cell} key={i}>
                        {y}
                    </Box>
                ))}
            {transeferDialog}
        </ListItem>
    )
}
//#endregion

export interface WalletAssetsTableProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    wallet: WalletRecord
    state: any
    dispatch: any
}
export function WalletAssetsTable(props: WalletAssetsTableProps) {
    const { t } = useI18N()
    const { wallet, state, dispatch } = props
    const { detailedToken, detailedTokensLoading, detailedTokensRetry } = useContext(DashboardWalletsContext)
    const network = currentSubstrateNetworkSettings.value
    const classes = useStylesExtends(useStyles(), props)
    const LABELS = [t('wallet_assets'), t('wallet_balance'), ''] as const

    const [more, setMore] = useState<boolean>(false)

    const { enqueueSnackbar } = useSnackbar()
    const { transferState } = state
    const { balanceAll, address, token } = detailedToken

    const erc20Tokens = useERC20TokensFromDB()

    useEffect(() => {
        if (transferState?.type === StateType.UNKNOWN) return
        if (transferState?.type === StateType.IS_IN_BLOCK || transferState?.type === StateType.CONFIRMED) {
            enqueueSnackbar(t('transfer_in_finalized'), {
                variant: 'success',
            })
            detailedTokensRetry()
            dispatch({
                type: ActionType.SET_TRANSFER_STATE,
                payload: {
                    state: null,
                },
            })
        }
    }, [
        transferState?.type,
        enqueueSnackbar,
        detailedTokensRetry,
        t,
        dispatch /* update tx dialog only if state changed */,
    ])

    //#region transfer tokens
    if (detailedTokensLoading || !detailedToken) return null

    if (!detailedToken?.balanceAll || state.apiState !== 'READY')
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}>
                <Typography color="textSecondary">No token found.</Typography>
                <Button
                    sx={{
                        marginTop: 1,
                    }}
                    variant="text"
                    onClick={() => detailedTokensRetry()}>
                    Retry
                </Button>
            </Box>
        )

    return (
        <>
            <TableContainer className={classes.container}>
                <List className={classes.table}>
                    <ListItem className={classes.head}>
                        {LABELS.map((x, i) => (
                            <Box className={classes.cell} key={i}>
                                {x}
                            </Box>
                        ))}
                    </ListItem>
                    {detailedTokensLoading ? (
                        new Array(3).fill(0).map((_, i) => (
                            <ListItem classes={{ root: classes.row }} key={i}>
                                <Box>
                                    <Skeleton
                                        animation="wave"
                                        variant="rectangular"
                                        width="100%"
                                        height={30}></Skeleton>
                                </Box>
                                <Box>
                                    <Skeleton
                                        animation="wave"
                                        variant="rectangular"
                                        width="100%"
                                        height={30}></Skeleton>
                                </Box>
                                <Box>
                                    <Skeleton
                                        animation="wave"
                                        variant="rectangular"
                                        width="100%"
                                        height={30}></Skeleton>
                                </Box>
                                <Box>
                                    <Skeleton
                                        animation="wave"
                                        variant="rectangular"
                                        width="100%"
                                        height={30}></Skeleton>
                                </Box>
                                <Box>
                                    <Skeleton
                                        animation="wave"
                                        variant="rectangular"
                                        width="100%"
                                        height={30}></Skeleton>
                                </Box>
                            </ListItem>
                        ))
                    ) : (
                        <>
                            <ViewDetailed
                                address={address}
                                balanceAll={balanceAll}
                                key={address}
                                detailedToken={detailedToken}
                                token={token}
                                wallet={wallet}
                                transferState={transferState}
                            />
                            {network === SubstrateNetwork.SubDAO &&
                                erc20Tokens?.map((o, idx) => (
                                    <ViewDetailed
                                        isERC20
                                        key={idx}
                                        token={o}
                                        transferState={transferState}
                                        wallet={wallet}
                                    />
                                ))}
                        </>
                    )}
                </List>
            </TableContainer>
            {/* {Boolean(erc20Tokens?.length) && (
                <div className={classes.lessButton}>
                    <IconButton
                        onClick={() => {
                            setMore(!more)
                        }}>
                        {more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </div>
            )} */}
        </>
    )
}
