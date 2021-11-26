import { useCallback, ChangeEvent, useMemo } from 'react'
import {
    makeStyles,
    createStyles,
    TextField,
    Typography,
    Box,
    Chip,
    InputProps,
    ChipProps,
    TextFieldProps,
} from '@material-ui/core'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { SelectTokenChip, SelectTokenChipProps } from './SelectTokenChip'
import { formatBalance } from '../../plugins/Wallet/formatter'
import { MIN_AMOUNT_LENGTH, MAX_AMOUNT_LENGTH } from '../constants'
import { useStylesExtends } from '../../components/custom-ui-helper'
import type { EtherTokenDetailed, ERC20TokenDetailed } from '../types'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            flex: 3,
            '&:first-child': {
                marginTop: theme.spacing(1.25),
            },
            '& label': {
                transform: 'translate(-0, -6px) scale(0.75) !important',
                textAlign: 'left',
                position: 'inherit',
            },
            '& label text': {
                color: '#D51172',
            },
            '& fieldset': {
                top: 0,
            },
            '& .MuiInputBase-input': {
                paddingTop: '12px',
                paddingBottom: '12px',
                height: 44,
            },
            '& legend': {
                display: 'none',
            },
        },
        input: {
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                '-webkit-appearance': 'none',
                margin: 0,
            },
            '-moz-appearance': 'textfield',
        },
        max: {
            marginRight: theme.spacing(0.5),
            borderRadius: 8,
        },
        token: {
            whiteSpace: 'pre',
            maxWidth: 300,
            paddingLeft: theme.spacing(1),
        },
        balance: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: '80%',
            fontSize: 14,
        },
        inputShrinkLabel: {
            transform: 'translate(17px, -3px) scale(0.75) !important',
        },
        logo: {
            width: 18,
            height: 18,
        },

        panel: {
            width: '100%',
        },
        panelContent: {
            display: 'flex',
            alignItems: 'flex-end',
        },
        balanceBox: {
            flex: 2,
            marginLeft: 10,
            backgroundColor: '#F7F8FB',
            height: 68,
            border: '1px solid #F7F8FB',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
        },
        balanceUnit: {
            fontSize: 14,
            marginLeft: 2,
        },
        title: {
            textAlign: 'left',
            fontSize: 14,
            marginBottom: -4,
            '& span': {
                color: '#D52473',
            },
        },
    })
})

export interface TokenAmountPanelProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    amount: string
    maxAmount?: string
    balance: string
    disableBalance?: boolean
    label: string
    token?: EtherTokenDetailed | ERC20TokenDetailed | null
    onAmountChange: (amount: string) => void
    InputProps?: Partial<InputProps>
    MaxChipProps?: Partial<ChipProps>
    MaxChipStyle?: ChipProps['classes']
    SelectTokenChip?: Partial<SelectTokenChipProps>
    TextFieldProps?: Partial<TextFieldProps>
}

export function TokenAmountPanel(props: TokenAmountPanelProps) {
    const { amount, maxAmount, balance, token, onAmountChange, label, disableBalance = false, MaxChipProps } = props

    const classes = useStylesExtends(useStyles(), props)

    //#region update amount by parent
    const { RE_MATCH_WHOLE_AMOUNT } = useMemo(
        () => ({
            RE_MATCH_WHOLE_AMOUNT: new RegExp(`^\\d*\\.?\\d{0,${token?.decimals}}$`), // d.ddd...d
        }),
        [token?.decimals],
    )
    //#endregion

    //#region update amount by self
    const onChange = useCallback(
        (ev: ChangeEvent<HTMLInputElement>) => {
            const amount_ = ev.currentTarget.value.replace(/,/g, '.')
            if (amount_ === '' || RE_MATCH_WHOLE_AMOUNT.test(amount_)) onAmountChange(amount_)
        },
        [onAmountChange, RE_MATCH_WHOLE_AMOUNT],
    )
    //#endregion
    console.log('Z******** ', token)

    return (
        <div className={classes.panel}>
            <Typography className={classes.title}>
                {label}
                <span>*</span>
            </Typography>
            <div className={classes.panelContent}>
                <TextField
                    className={classes.root}
                    fullWidth
                    required
                    type="text"
                    value={amount}
                    variant="outlined"
                    onChange={onChange}
                    InputProps={{
                        inputProps: {
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            title: 'Token Amount',
                            inputMode: 'decimal',
                            min: 0,
                            minLength: MIN_AMOUNT_LENGTH,
                            maxLength: MAX_AMOUNT_LENGTH,
                            pattern: '^[0-9]*[.,]?[0-9]*$',
                            placeholder: '0.0',
                            spellCheck: false,
                            className: classes.input,
                        },
                        ...props.InputProps,
                    }}
                    InputLabelProps={{
                        shrink: true,
                        classes: {
                            shrink: classes.inputShrinkLabel,
                        },
                    }}
                    {...props.TextFieldProps}
                />
                {token ? (
                    <Box
                        className={classes.balanceBox}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                        }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                            {balance !== '0' && !disableBalance ? (
                                <Chip
                                    classes={{
                                        root: classNames(classes.max, MaxChipProps?.classes?.root),
                                        ...MaxChipProps?.classes,
                                    }}
                                    size="small"
                                    label="MAX"
                                    clickable
                                    color="primary"
                                    variant="outlined"
                                    onClick={() => {
                                        onAmountChange(
                                            formatBalance(new BigNumber(maxAmount ?? balance), token.decimals),
                                        )
                                    }}
                                    {...MaxChipProps}
                                />
                            ) : null}
                            <SelectTokenChip token={token} {...props.SelectTokenChip} />
                        </Box>

                        {!disableBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                Balance:
                                <Typography color="textPrimary" component="span" className={classes.balanceUnit}>
                                    {formatBalance(new BigNumber(balance), token.decimals, 6)}
                                    {token.symbol}
                                </Typography>
                            </Typography>
                        ) : null}
                    </Box>
                ) : (
                    <Box
                        className={classes.balanceBox}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginTop: 2,
                        }}>
                        {!disableBalance ? (
                            <Typography
                                className={classes.balance}
                                color="textSecondary"
                                variant="body2"
                                component="span">
                                -
                            </Typography>
                        ) : null}
                        <SelectTokenChip token={token} {...props.SelectTokenChip} />
                    </Box>
                )}
            </div>
        </div>
    )
}
