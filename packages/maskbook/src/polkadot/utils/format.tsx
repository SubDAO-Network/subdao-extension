import BN from 'bn.js'
import { BN_TEN, BN_ZERO, isBn } from '@polkadot/util'
import { tokenDetail } from '../constants'
import { isNumber, first } from 'lodash-es'
import type { TokenDetailed } from '../types'

export const formatResult = (result: any) => {
    let str
    if (result && result.output) {
        str = result.output.toHuman()
    }
    return str
}

export const isValideBNString = (_amount: string) => {
    let amount = Number(_amount)
    if (isNumber(amount)) {
        return false
    }
    return true
}
function isValidNumber(bn: BN, maxValue?: BN): boolean {
    if (
        // cannot be negative
        bn.lt(BN_ZERO) ||
        // // check that the bitlengths fit
        // (bn.bitLength() > (bitLength || DEFAULT_BITLENGTH)) ||
        // cannot be > max (if specified)
        (maxValue && maxValue.gtn(0) && bn.gt(maxValue))
    ) {
        return false
    }

    return true
}

export const formatAmount = (_amount?: string | number, _token?: TokenDetailed): [BN | null, boolean] => {
    let token = _token || tokenDetail
    let amount: number | string = Number(_amount)
    if (!isNumber(amount)) {
        return [null, false]
    }
    amount = String(amount) as string
    const isDecimalValue = amount?.match(/^(\d+)\.(\d+)$/)
    let siPower = new BN(token.decimals)

    let result
    if (isDecimalValue) {
        const div = new BN(amount?.replace(/\.\d*$/, ''))
        const modString = amount?.replace(/^\d+\./, '').substr(0, token.decimals)
        const mod = new BN(modString)

        result = div.mul(BN_TEN.pow(siPower)).add(mod.mul(BN_TEN.pow(new BN(token.decimals - modString.length))))
    } else {
        result = new BN(amount?.replace(/[^\d]/g, '')).mul(BN_TEN.pow(siPower))
    }
    return [result, isValidNumber(result)]
}

export const isValidAmountAvailable = (_amount: string, tokenBalance: string, _token?: TokenDetailed) => {
    let token = _token || (tokenDetail as TokenDetailed)
    let amount = Number(_amount)
    console.log(`isValidAmountAvailable --- amount: ${amount}`)
    if (!isNumber(amount)) {
        return false
    }

    const transferAmount = first(formatAmount(amount, token))
    console.log(`transferAmount: ${transferAmount}`)
    return isBn(transferAmount) ? (transferAmount as BN).lt(new BN(tokenBalance)) : false
}
