import { useCallback, useState } from 'react'
import { uniqBy } from 'lodash-es'
import { FixedSizeList, FixedSizeListProps } from 'react-window'
import { makeStyles, createStyles, Typography } from '@material-ui/core'
import { EthereumAddress } from 'wallet.ts'
import {
    TokenListsState,
    useERC20TokensDetailedFromTokenLists,
} from '../../../polkadot/hooks/useERC20TokensDetailedFromTokenLists'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { isSameAddress } from '../../../web3/helpers'
import { TokenInList } from './TokenInList'
import CircularProgress from '@material-ui/core/CircularProgress'
import { useI18N } from '../../../utils/i18n-next-ui'
import { ERC20_TOKEN_LISTS } from '../../../polkadot/constants'

import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

const useStyles = makeStyles((theme) =>
    createStyles({
        list: {},
        placeholder: {},
        center: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
    }),
)

export interface FixedTokenListProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    keyword?: string
    whitelist?: string[]
    blacklist?: string[]
    tokens?: (ERC20TokenDetailed | EtherTokenDetailed)[]
    selectedTokens?: string[]
    onSubmit?(token: EtherTokenDetailed | ERC20TokenDetailed): void
    FixedSizeListProps?: Partial<FixedSizeListProps>
}

export function FixedTokenList(props: FixedTokenListProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const {
        keyword,
        whitelist: includeTokens = [],
        blacklist: excludeTokens = [],
        selectedTokens = [],
        tokens = [],
        onSubmit,
        FixedSizeListProps,
    } = props

    //#region search tokens
    // const ERC20_TOKEN_LISTS = useConstant(CONSTANTS, 'ERC20_TOKEN_LISTS')
    const [address, setAddress] = useState('')
    const { state, tokensDetailed: erc20TokensDetailed } = useERC20TokensDetailedFromTokenLists(
        ERC20_TOKEN_LISTS,
        keyword,
    )
    //#endregion

    //#region UI helpers
    const renderPlaceholder = (message: string) => (
        <Typography className={classes.placeholder} color="textSecondary">
            {message}
        </Typography>
    )
    //#endregion

    if (state === TokenListsState.LOADING_TOKEN_LISTS)
        return (
            <div className={classes.center}>
                <CircularProgress />
            </div>
        )
    if (state === TokenListsState.LOADING_SEARCHED_TOKEN) return renderPlaceholder(t('loading_token'))
    if (!erc20TokensDetailed.length) return renderPlaceholder(t('no_token_found'))

    const filteredTokens = erc20TokensDetailed.filter(
        (x) => !!x.address,
        // (x) =>
        //     (!includeTokens.length || includeTokens.some((y) => isSameAddress(y, x.address))) &&
        //     (!excludeTokens.length || !excludeTokens.some((y) => isSameAddress(y, x.address))),
    )
    const renderTokens = uniqBy([...tokens, ...filteredTokens], (x) => x.address.toLowerCase())

    return (
        <FixedSizeList
            className={classes.list}
            width="100%"
            height={100}
            overscanCount={4}
            itemSize={50}
            itemData={{
                tokens: renderTokens,
                selected: [address, ...selectedTokens],
                onSelect(address: string) {
                    console.log('onselected, :', address)
                    const token = renderTokens.find((token) => isSameAddress(token.address, address))
                    console.log('token, :', token)
                    if (!token) return
                    setAddress(token.address)
                    onSubmit?.(token)
                },
            }}
            itemCount={renderTokens.length}
            {...FixedSizeListProps}>
            {TokenInList}
        </FixedSizeList>
    )
}
