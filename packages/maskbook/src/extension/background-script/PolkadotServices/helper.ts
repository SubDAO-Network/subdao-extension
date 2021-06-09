export function formatResult(result: any) {
    if (result && result?.output) {
        return result?.output?.toHuman() || result?.output
    }
    return []
}
