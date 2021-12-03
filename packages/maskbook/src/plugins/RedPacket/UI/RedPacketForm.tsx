import { useState, useCallback, useMemo, ChangeEvent, useEffect } from 'react'
import {
    makeStyles,
    FormControl,
    TextField,
    createStyles,
    InputLabel,
    Select,
    MenuItem,
    MenuProps,
    InputBase,
    Typography,
    experimentalStyled as styled,
} from '@material-ui/core'
import { omit } from 'lodash-es'
import { v4 as uuid } from 'uuid'
import BigNumber from 'bignumber.js'

import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { formatBalance } from '../../Wallet/formatter'
import { RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES, RED_PACKET_DEFAULT_SHARES } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SubdaoTokenType, ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { InjectTokenAmountPanel } from '../../../web3/UI/TokenAmountPanel'
import { useCreateCallback } from '../hooks/useCreateCallback'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { TransactionStateType } from '../../../web3/hooks/useTransactionState'
import type { RedPacketJSONPayload } from '../types'
import { SelectTokenDialogEvent, WalletMessages } from '../../Wallet/messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useCoinBalance } from '../../../web3/hooks/useCoinBalance'
import { EthereumMessages } from '../../Ethereum/messages'
import { SubdaoWalletConnectedBoundary } from '../../../web3/UI/SubdaoWalletConnectedBoundary'
import { SubERC20TokenApprovedBoundary } from '../../../web3/UI/SubERC20TokenApprovedBoundary'
import { redPacketAddress } from '../../../polkadot/constants'
import { useERC20TokensDetailedFromTokenLists } from '../../../polkadot/hooks/useERC20TokensDetailedFromTokenLists'
import { ERC20_TOKEN_LISTS } from '../../../polkadot/constants'
import { currentSubstrateNetworkSettings } from '../../../settings/settings'
import { SubstrateNetwork } from '../../../polkadot/constants'

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(1),
        },
        input: {
            flex: 1,
        },
        tip: {
            fontSize: 12,
            color: theme.palette.text.secondary,
        },
        button: {
            margin: theme.spacing(2, 0),
            padding: 12,
        },
        selectShrinkLabel: {
            transform: 'translate(17px, -12px) scale(0.75) !important',
        },
        inputShrinkLabel: {
            transform: 'translate(17px, -3px) scale(0.75) !important',
        },
        wishesInput: {
            background: '#F8F8F8',
            border: '1px solid #E5E5E5',
            fontSize: 14,
            lineHeight: '16px',
            height: 60,
            padding: 10,
            fontWeight: 400,
            '& textarea': {
                height: '100%',
            },
        },
        modeSelect: {
            color: '#212121',
            fontWeight: 400,
            '& fieldset': {
                border: 'none !important',
            },
        },
        modeInput: {
            background: '#F8F8F8',
            border: '1px solid #E5E5E5',
            fontSize: 14,
            height: 40,
            color: '#212121',
            padding: 0,
            paddingLeft: 10,
            lineHeight: '40px',
        },
        modeForm: {
            flex: 1,
            marginRight: 10,
        },
        shareInput: {
            background: '#F8F8F8',
            border: '1px solid #E5E5E5',
            fontSize: 14,
            height: 40,
            color: '#212121',
            paddingLeft: 10,
            fontWeight: 400,
        },
    }),
)

const InputTitle = styled(Typography)`
    font-weight: 400;
    color: rgba(33, 33, 33, 0.4);
    line-height: 14px;
    font-size: 12px;
    margin-bottom: 8px;
`

export interface RedPacketFormProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    onCreate?(payload: RedPacketJSONPayload): void
    SelectMenuProps?: Partial<MenuProps>
}

export function RedPacketForm(props: RedPacketFormProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const network = currentSubstrateNetworkSettings.value
    const HAPPY_RED_PACKET_ADDRESS = redPacketAddress[network]

    // context
    // polkdot wallet address
    const account = useAccount()

    //#region select token
    const { state, tokensDetailed } = useERC20TokensDetailedFromTokenLists(ERC20_TOKEN_LISTS)
    const sudaoTokenDetailed = tokensDetailed[0]

    const [token = sudaoTokenDetailed, setToken] = useState<EtherTokenDetailed | ERC20TokenDetailed | undefined>()

    const [id] = useState(uuid())
    const [, setSelectTokenDialogOpen] = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== id) return
                setToken(ev.token)
            },
            [id],
        ),
    )
    const onSelectTokenChipClick = useCallback(() => {
        setSelectTokenDialogOpen({
            open: true,
            uuid: id,
            disableEther: true,
            FixedTokenListProps: {
                selectedTokens: token ? [token.address] : [],
            },
        })
    }, [id, token?.address])
    //#endregion

    //#region packet settings
    const [isRandom, setIsRandom] = useState(0)
    const [message, setMessage] = useState('Best Wishes!')
    const senderName = useCurrentIdentity()?.linkedPersona?.nickname ?? 'Unknown User'
    console.log(`senderName`, senderName)
    // shares
    const [shares, setShares] = useState<number | ''>(RED_PACKET_DEFAULT_SHARES)
    const onShareChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const shares_ = ev.currentTarget.value.replace(/[,\.]/g, '')
            if (shares_ === '') setShares('')
            else if (/^[1-9]+\d*$/.test(shares_)) {
                const parsed = Number.parseInt(shares_, 10)
                if (parsed >= RED_PACKET_MIN_SHARES && parsed <= RED_PACKET_MAX_SHARES)
                    setShares(Number.parseInt(shares_, 10))
            }
        },
        [RED_PACKET_MIN_SHARES, RED_PACKET_MAX_SHARES],
    )

    // amount
    const [rawAmount, setRawAmount] = useState('0')
    const amount = new BigNumber(rawAmount || '0').multipliedBy(new BigNumber(10).pow(token?.decimals ?? 0))
    const totalAmount = !isRandom ? new BigNumber(amount).multipliedBy(shares || '0') : amount

    // balance
    const { value: tokenBalance = '0', loading: loadingTokenBalance } = useCoinBalance(
        ((token?.type as unknown) as SubdaoTokenType) ?? SubdaoTokenType.ERC20,
        token?.address ?? '',
    )
    //#endregion

    //#region blocking
    const duration = 1000 * 60 * 60 * 24 /* milliseconds */
    const [createSettings, createState, createCallback, resetCreateCallback] = useCreateCallback({
        password: uuid(),
        endTime: Date.now() + duration,
        isRandom: Boolean(isRandom),
        name: senderName,
        message,
        shares: shares || 0,
        token,
        total: totalAmount.toFixed(),
    })
    //#endregion

    //#region remote controlled transaction dialog
    const [_, setTransactionDialogOpen] = useRemoteControlledDialog(
        EthereumMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return

            // reset state
            resetCreateCallback()

            // the settings is not available
            if (!createSettings?.token) return

            // TODO:
            // earily return happended
            // we should guide user to select the red packet in the existing list
            // if (createState.type !== TransactionStateType.CONFIRMED) return
            if (createState.type !== TransactionStateType.FINALIZED) return

            // const { receipt } = createState
            // const CreationSuccess = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
            //     creation_time: string
            //     creator: string
            //     id: string
            //     token_address: string
            //     total: string
            // }

            // assemble JSON payload
            const payload: RedPacketJSONPayload = {
                contract_version: 1,
                contract_address: HAPPY_RED_PACKET_ADDRESS,
                rpid: createSettings.rpid ?? '',
                password: createSettings.password,
                shares: createSettings.shares,
                sender: {
                    address: account,
                    name: createSettings.name,
                    message: createSettings.message,
                },
                token: {
                    address: token?.address ?? '',
                    name: token?.name ?? '',
                    decimals: Number(token?.decimals) ?? 0,
                    symbol: token?.symbol ?? '',
                },
                is_random: createSettings.isRandom,
                total: totalAmount.toFixed(),
                end_time: createSettings.endTime,
                token_type: createSettings.token.type ?? 0,
                network,
            }

            if (createSettings.token.type === SubdaoTokenType.ERC20) {
                payload.token = {
                    ...omit(createSettings.token, ['type', 'chainId']),
                }
            }

            // output the redpacket as JSON payload
            props.onCreate?.(payload)

            // always reset amount
            setRawAmount('0')
        },
    )

    // open the transaction dialog
    useEffect(() => {
        if (!token || createState.type === TransactionStateType.UNKNOWN) return
        setTransactionDialogOpen({
            open: true,
            state: createState,
            summary: `Creating red packet with ${formatBalance(
                new BigNumber(totalAmount),
                token.decimals ?? 0,
                token.decimals ?? 0,
            )} ${token.symbol}`,
        })
    }, [createState /* update tx dialog only if state changed */])
    //#endregion

    useMemo(() => {
        setToken(sudaoTokenDetailed)
    }, [sudaoTokenDetailed])

    //#region connect wallet
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const onConnect = useCallback(() => {
        setSelectProviderDialogOpen({
            open: true,
        })
    }, [setSelectProviderDialogOpen])
    //#endregion

    const validationMessage = useMemo(() => {
        if (!token) return t('plugin_wallet_select_a_token')
        if (!account) return t('plugin_wallet_connect_a_wallet')
        if (new BigNumber(shares || '0').isZero()) return 'Enter shares'
        if (new BigNumber(shares || '0').isGreaterThan(100)) return 'At most 100 recipients'
        if (new BigNumber(amount).isZero()) return t('plugin_ito_error_enter_amount')
        if (tokenBalance === null || new BigNumber(totalAmount).isGreaterThan(new BigNumber(tokenBalance))) {
            return t('plugin_ito_error_balance', { symbol: token.symbol })
        }
        return ''
    }, [account, amount, t, totalAmount, shares, token, tokenBalance])

    if (!token) return null

    const PolkadotAndKusamaActions =
        validationMessage !== '' ? (
            <ActionButton variant="contained" className={classes.button} disabled>
                {validationMessage}
            </ActionButton>
        ) : (
            <ActionButton variant="contained" className={classes.button} onClick={createCallback}>
                {`Send ${formatBalance(totalAmount, token.decimals)} ${token.symbol}`}
            </ActionButton>
        )

    return (
        <>
            <div className={classes.line}>
                <FormControl className={classes.modeForm} variant="outlined">
                    <InputTitle>{t('plugin_red_packet_split_mode')}</InputTitle>
                    {/* <InputLabel className={classes.selectShrinkLabel}>{t('plugin_red_packet_split_mode')}</InputLabel> */}
                    <Select
                        className={classes.modeSelect}
                        classes={{ root: classes.modeInput }}
                        value={isRandom ? 1 : 0}
                        onChange={(e) => {
                            // foolproof, reset amount since the meaning of amount changed:
                            //  'total amount' <=> 'amount per share'
                            setRawAmount('0')
                            setIsRandom(e.target.value as number)
                        }}
                        MenuProps={props.SelectMenuProps}>
                        <MenuItem value={0}>{t('plugin_red_packet_average')}</MenuItem>
                        <MenuItem value={1}>{t('plugin_red_packet_random')}</MenuItem>
                    </Select>
                </FormControl>
                <div style={{ flex: 1, marginLeft: 10 }}>
                    <InputTitle>{t('plugin_red_packet_shares')}</InputTitle>
                    <InputBase
                        fullWidth
                        classes={{ root: classes.shareInput }}
                        inputProps={{
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            inputMode: 'decimal',
                            placeholder: '0',
                            pattern: '^[0-9]$',
                            spellCheck: false,
                        }}
                        value={shares}
                        onChange={onShareChange}
                    />
                </div>
            </div>
            <div className={classes.line}>
                <InjectTokenAmountPanel
                    classes={{ root: classes.input }}
                    label={isRandom ? 'Total Amount' : 'Amount per Share'}
                    amount={rawAmount}
                    balance={tokenBalance ?? '0'}
                    token={token}
                    onAmountChange={setRawAmount}
                    SelectTokenChip={{
                        loading: loadingTokenBalance,
                        ChipProps: {
                            onClick: onSelectTokenChipClick,
                        },
                    }}
                />
            </div>
            <div>
                <InputTitle>{t('plugin_red_packet_attached_message')}</InputTitle>
                <InputBase
                    fullWidth
                    classes={{ root: classes.wishesInput }}
                    onChange={(e) => setMessage(e.target.value)}
                    inputProps={{ placeholder: t('plugin_red_packet_best_wishes') }}
                    defaultValue={t('plugin_red_packet_best_wishes')}
                    multiline
                    rows={2}
                />
            </div>
            <SubdaoWalletConnectedBoundary>
                {network === SubstrateNetwork.Polkadot || network === SubstrateNetwork.Kusama ? (
                    PolkadotAndKusamaActions
                ) : (
                    <SubERC20TokenApprovedBoundary
                        amount={totalAmount.toFixed()}
                        token={token as any}
                        spender={HAPPY_RED_PACKET_ADDRESS}>
                        <ActionButton variant="contained" className={classes.button} onClick={createCallback}>
                            {validationMessage || `Send ${formatBalance(totalAmount, token.decimals)} ${token.symbol}`}
                        </ActionButton>
                    </SubERC20TokenApprovedBoundary>
                )}
            </SubdaoWalletConnectedBoundary>
        </>
    )
}
