import { mainAddress } from '../constants'

export function isSameAddress(addrA: string, addrB: string) {
    return addrA.toLowerCase() === addrB.toLowerCase()
}

export function isSubdaoAddress(address: string) {
    return isSameAddress(address, mainAddress.main)
}
