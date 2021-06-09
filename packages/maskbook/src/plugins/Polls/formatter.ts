import type { OptionItem, VoteOption } from './types'

export function formatChoices(option: string): VoteOption {
    const result: VoteOption = {
        options: [],
        total_number: 0,
    }

    if (!option) {
        return result
    }
    const optionArray: string[] = option.split('|')

    // option 01:0|option 02:0|option 03:0
    result.options = optionArray.map((o) => {
        const item = o.split(':')
        if (!item || item.length !== 2) {
            console.error('Vote data choices error choices: ', option)
            return {} as OptionItem
        }
        result.total_number += Number(item[1])
        return {
            name: item[0],
            vote_number: Number(item[1]),
        } as OptionItem
    })
    return result
}
