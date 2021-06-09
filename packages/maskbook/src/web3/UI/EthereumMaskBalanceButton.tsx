import { useState, useCallback, useMemo } from 'react'
import { createStyles, makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../components/custom-ui-helper'
import ActionButton from '../../extension/options-page/DashboardComponents/ActionButton'
import { MaskbookIcon } from '../../resources/MaskbookIcon'
import { useFormatPolkadotFreeBalance } from '../../polkadot/hooks/useFormatPolkadotFreeBalance'
import { mainAddress } from '../../polkadot/constants'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            borderRadius: 16,
            fontWeight: 300,
            backgroundColor: theme.palette.primary.main,
            '&:hover, &:active': {
                backgroundColor: theme.palette.primary.main,
            },
        },
        icon: {
            border: `solid 1px ${theme.palette.common.white}`,
            borderRadius: '50%',
            marginRight: theme.spacing(0.5),
        },
    })
})

export interface EthereumMaskBalanceButtonProps extends withClasses<'root'> {}

export function EthereumMaskBalanceButton(props: EthereumMaskBalanceButtonProps) {
    const classes = useStylesExtends(useStyles(), props)

    //#region token balance
    const {
        value: maskBalance = '0',
        error: maskBalanceError,
        loading: maskBalanceLoading,
        retry: maskBalanceRetry,
    } = useFormatPolkadotFreeBalance(mainAddress.main)
    //#endregion

    return (
        <>
            <ActionButton className={classes.root} variant="contained" color="primary" loading={maskBalanceLoading}>
                {process.env.architecture === 'web' && !maskBalanceLoading && <MaskbookIcon className={classes.icon} />}
                <Typography>{maskBalance}</Typography>
            </ActionButton>
        </>
    )
}
