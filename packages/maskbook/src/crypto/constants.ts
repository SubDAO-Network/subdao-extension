export const VERSION = {
    latest: -20,
    validate: -20,
    canShard: -20,
}

export function isValidVersion(version: number) {
    return version === VERSION.validate
}

// export const flagChart = '🎼'
export const flagChart = '🎛'

export function isSharedPublicVersion(version: number) {
    return version === VERSION.canShard
}
