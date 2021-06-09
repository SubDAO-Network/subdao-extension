import { useContext, ChangeEvent, useMemo, useState, useCallback, useEffect } from 'react'
import { Send as SendIcon } from 'react-feather'
import {
    Box,
    Button,
    createStyles,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
    Theme,
    Typography,
    CircularProgress,
} from '@material-ui/core'
import type { WalletRecord } from '../../../plugins/Wallet/database/types'
import type { DeriveBalancesAll } from '@polkadot/api-derive/types'
import {
    DashboardDialogCore,
    DashboardDialogWrapper,
    useSnackbarCallback,
    WrappedDialogProps,
} from '../DashboardDialogs/Base'
import AbstractTab, { AbstractTabProps } from './AbstractTab'
import { useI18N } from '../../../utils/i18n-next-ui'
import { TokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useCopyToClipboard } from 'react-use'
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined'
import { QRCode } from '../../../components/shared/qrcode'
import { isValidAddress } from '../../../plugins/Wallet/services/formatter'
import { useTransferTokenCallback } from '../../../polkadot/hooks/useTransferTokenCallback'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PolkadotTransactionStateType as StateType } from '../../../polkadot/hooks/useTransactionState'
// import { DashboardWalletsContext } from '../DashboardRouters/Wallets'
import { EthereumMessages } from '../../../plugins/Ethereum/messages'
import type { TokenDetailed } from '../../../polkadot/types'
import { PolkadotTokenType } from '../../../polkadot/types'
import type { ERC20TokenDetailed } from '../../../web3/types'
import { useTokenBalance } from '../../../polkadot/hooks/useTokenBalance'
import { isValidAmountAvailable, formatAmount } from '../../../polkadot/utils/format'
import { isSameAddress, isSubdaoAddress } from '../../../polkadot/utils/helpers'

const circleIcon = <CircularProgress color="inherit" size={12} />

interface WalletProps {
    wallet: WalletRecord
}

//#region transfer tab
const useTransferTabStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
        },
        button: {
            marginTop: theme.spacing(3),
        },
        maxChipRoot: {
            fontSize: 11,
            height: 21,
        },
        maxChipLabel: {
            paddingLeft: 6,
            paddingRight: 6,
        },
    }),
)

interface TransferTabProps {
    wallet: WalletRecord
    balanceAll?: DeriveBalancesAll
    token: TokenDetailed
    onClose: () => void
}

function TransferTab(props: TransferTabProps) {
    const classes = useTransferTabStyles()
    const { token, onClose, wallet } = props
    const { t } = useI18N()

    // const { detailedTokensRetry } = useContext(DashboardWalletsContext)
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const isERC20 = !isSubdaoAddress(token.address)
    const [validationMessage, setValidationMessage] = useState<string>('')
    const tokenType = isERC20 ? PolkadotTokenType.ERC20 : PolkadotTokenType.DOT

    // balance
    const { value: respon } = useTokenBalance(tokenType, token.address)
    const tokenBalance: string = respon?.toString() || '0'

    //#region transfer tokens
    const [transferState, transferCallback, resetTransferCallback] = useTransferTokenCallback(tokenType, token)

    const onTransfer = useCallback(async () => {
        await transferCallback(amount, address)
    }, [transferCallback, amount, address])

    useEffect(() => {
        if (transferState?.type === StateType.UNKNOWN) return
        if (transferState?.type === StateType.WAIT_FOR_CONFIRMING) {
            onClose()
        }
    }, [transferState?.type, onClose])
    //#endregion

    //#region validation
    useMemo(async () => {
        let transfer = formatAmount(amount)
        if (!transfer[1])
            return setValidationMessage(
                t('wallet_transfer_error_insufficent_balance', {
                    token: token.symbol,
                }),
            )
        if (!amount || transfer[0]?.isZero()) return setValidationMessage(t('wallet_transfer_error_amount_absence'))
        if (!address) return setValidationMessage(t('wallet_transfer_error_address_absence'))
        const isValid = isValidAddress(address)
        if (!isValid) return setValidationMessage(t('wallet_transfer_error_invalid_address'))
        if (isSameAddress(address, wallet.address)) return setValidationMessage(t('wallet_transfer_error_same_address'))
        return setValidationMessage('')
    }, [amount, address, token, t, wallet.address])
    //#endregion
    return (
        <div className={classes.root}>
            <TokenAmountPanel
                amount={amount}
                balance={tokenBalance}
                label={t('wallet_transfer_amount')}
                token={token}
                onAmountChange={setAmount}
                SelectTokenChip={{
                    readonly: true,
                }}
                MaxChipProps={{
                    classes: {
                        root: classes.maxChipRoot,
                        label: classes.maxChipLabel,
                    },
                }}
            />
            <TextField
                required
                label={t('wallet_transfer_to_address')}
                placeholder={t('wallet_transfer_to_address')}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
            />
            <Button
                className={classes.button}
                variant="contained"
                color="primary"
                startIcon={transferState?.type === StateType.WAIT_FOR_CONFIRMING && circleIcon}
                disabled={!!validationMessage || transferState.type === StateType.WAIT_FOR_CONFIRMING}
                onClick={onTransfer}>
                {validationMessage || t('wallet_transfer_send')}
            </Button>
        </div>
    )
}
//#endregion

//#region receive tab
const useReceiveTab = makeStyles((theme: Theme) =>
    createStyles({
        qr: {
            marginTop: theme.spacing(2),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        form: {
            padding: theme.spacing(1),
        },
    }),
)

interface ReceiveTabProps {
    wallet: WalletRecord
    onClose: () => void
}

function ReceiveTab(props: ReceiveTabProps) {
    const { wallet } = props
    const { t } = useI18N()
    const classes = useReceiveTab()

    const [, copyToClipboard] = useCopyToClipboard()
    const copyWalletAddress = useSnackbarCallback(async (address: string) => copyToClipboard(address), [])
    return (
        <>
            <form className={classes.form}>
                <TextField
                    required
                    label={t('wallet_address')}
                    value={wallet.address}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation()
                                        copyWalletAddress(wallet.address)
                                    }}>
                                    <FileCopyOutlinedIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    variant="outlined"
                />
            </form>
            <div className={classes.qr}>
                <QRCode
                    text={`polkadot:${wallet.address}`}
                    options={{ width: 200 }}
                    canvasProps={{
                        style: { display: 'block', margin: 'auto' },
                    }}
                />
            </div>
        </>
    )
}
//#endregion

// WrappedDialogProps<WalletProps & { token: ERC20TokenDetailed | EtherTokenDetailed }>,
export function DashboardWalletTransferDialog(props: WrappedDialogProps<TransferTabProps>) {
    const { wallet, token } = props.ComponentProps!
    const { t } = useI18N()
    const state = useState(0)
    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_transfer_send'),
                children: <TransferTab wallet={wallet} token={token} onClose={props.onClose} />,
                sx: { p: 0 },
            },
            {
                label: t('wallet_transfer_receive'),
                children: <ReceiveTab wallet={wallet} onClose={props.onClose} />,
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary={t('wallet_transfer_title')}
                icon={<SendIcon />}
                iconColor="#4EE0BC"
                size="medium"
                content={<AbstractTab height={268} {...tabProps} />}
            />
        </DashboardDialogCore>
    )
}
