import type { Compact } from '@polkadot/types'
import type { Registry } from '@polkadot/types/types'

import type BN from 'bn.js'
import React, { useMemo } from 'react'
import { experimentalStyled as styled } from '@material-ui/core'
import { useI18N } from '../../utils/i18n-next-ui'

import { useSubstrate } from '../provider'
import { formatBalance } from '@polkadot/util'
import { networkNativeTokens } from '../constants'

interface Props {
    children?: React.ReactNode
    className?: string
    formatIndex?: number
    isShort?: boolean
    label?: React.ReactNode
    labelPost?: string
    value?: Compact<any> | BN | string | null | 'all'
    valueFormatted?: string
    withCurrency?: boolean
    withSi?: boolean
    useRegistry?: boolean
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

function getFormat(
    registry?: Registry,
    formatIndex = 0,
    useRegistry: boolean = false,
    provider?: string | undefined | null,
): [number, string] | undefined {
    if (!useRegistry || !registry) {
        const token = provider && networkNativeTokens[provider]
        if (token) {
            return [token.decimals, token.symbol]
        }
        return
    }

    const decimals = registry.chainDecimals
    const tokens = registry.chainTokens

    return [
        formatIndex < decimals.length ? decimals[formatIndex] : decimals[0],
        formatIndex < tokens.length ? tokens[formatIndex] : tokens[1],
    ]
}

function formatDisplay(prefix: string, postfix: string, unit: string, label = '', isShort = false): React.ReactNode {
    return (
        <>
            {`${prefix}${isShort ? '' : '.'}`}
            {!isShort && <span className="ui--FormatBalance-postfix">{`0000${postfix || ''}`.slice(-4)}</span>}
            <span className="ui--FormatBalance-unit"> {unit}</span>
            {label}
        </>
    )
}

function splitFormat(value: string, label?: string, isShort?: boolean): React.ReactNode {
    const [prefix, postfixFull] = value.split('.')
    const [postfix, unit] = postfixFull.split(' ')

    return formatDisplay(prefix, postfix, unit, label, isShort)
}

function format(
    value: Compact<any> | BN | string,
    [decimals, token]: [number, string],
    withCurrency = true,
    withSi?: boolean,
    _isShort?: boolean,
    labelPost?: string,
): React.ReactNode {
    const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.')
    const isShort = _isShort || (withSi && prefix.length >= K_LENGTH)
    const unitPost = withCurrency ? token : ''

    if (prefix.length > M_LENGTH) {
        const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.')
        const minor = rest.substr(0, 4)
        const unit = rest.substr(4)

        return (
            <>
                {major}.<span className="ui--FormatBalance-postfix">{minor}</span>
                <span className="ui--FormatBalance-unit">
                    {unit}
                    {unit ? unitPost : ` ${unitPost}`}
                </span>
                {labelPost || ''}
            </>
        )
    }

    return formatDisplay(prefix, postfix, unitPost, labelPost, isShort)
}

function FormatBalance({
    children,
    className = '',
    formatIndex,
    isShort,
    label,
    labelPost,
    value,
    valueFormatted,
    withCurrency,
    withSi,
    useRegistry = false,
}: Props): React.ReactElement<Props> {
    const { t } = useI18N()
    const { state } = useSubstrate()
    const api = state?.api
    const provider = state?.apiProvider
    const formatInfo = useMemo(() => getFormat(api?.registry, formatIndex, useRegistry, provider), [
        api,
        formatIndex,
        useRegistry,
        provider,
    ])

    // labelPost here looks messy, however we ensure we have one less text node
    return (
        <span className={`ui--FormatBalance ${className}`}>
            {label ? <>{label}&nbsp;</> : ''}
            <span className="ui--FormatBalance-value">
                {Boolean(valueFormatted)
                    ? splitFormat(valueFormatted as string, labelPost, isShort)
                    : Boolean(value)
                    ? value === 'all'
                        ? t('everything_labelpost', { labelPost })
                        : formatInfo && format(value as any, formatInfo, withCurrency, withSi, isShort, labelPost)
                    : `-${labelPost || ''}`}
            </span>
            {children}
        </span>
    )
}

export default React.memo(styled(FormatBalance)`
    display: inline-block;
    vertical-align: baseline;
    white-space: nowrap;
    * {
        vertical-align: baseline !important;
    }
    > label,
    > .label {
        display: inline-block;
        margin-right: 0.25rem;
        vertical-align: baseline;
    }
    .ui--FormatBalance-unit {
        font-size: 0.825em;
    }
    .ui--FormatBalance-value {
        text-align: right;
        > .ui--FormatBalance-postfix {
            font-weight: var(--font-weight-light);
            opacity: 0.7;
            vertical-align: baseline;
        }
    }
    > .ui--Button {
        margin-left: 0.25rem;
    }
    .ui--Icon {
        margin-bottom: -0.25rem;
        margin-top: 0.25rem;
    }
    .ui--Icon + .ui--FormatBalance-value {
        margin-left: 0.375rem;
    }
`)
