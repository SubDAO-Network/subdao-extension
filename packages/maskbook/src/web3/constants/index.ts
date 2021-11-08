import { ChainId } from '../types'

export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

export const CONSTANTS = {
    // token lists
    ERC20_TOKEN_LISTS: {
        [ChainId.Mainnet]: ['http://tokens.1inch.eth.link/'],
    },

    // contracts
    BALANCE_CHECKER_ADDRESS: {
        [ChainId.Mainnet]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
    },
    MULTICALL_ADDRESS: {
        [ChainId.Mainnet]: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441',
    },

    // tokens
    MASK_ADDRESS: {
        [ChainId.Mainnet]: '0x69af81e73A73B40adF4f3d4223Cd9b1ECE623074',
    },
    DAI_ADDRESS: {
        [ChainId.Mainnet]: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    OBK_ADDRESS: {
        [ChainId.Mainnet]: '0x75231F58b43240C9718Dd58B4967c5114342a86c',
    },
    ETH_ADDRESS: {
        [ChainId.Mainnet]: '0x0000000000000000000000000000000000000000',
    },

    // settings
    PROVIDER_ADDRESS_LIST:
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.build === 'beta'
            ? {
                  [ChainId.Mainnet]: ['https://mainnet.infura.io/v3/4ab93ab12e864f0eb58fae67143e0195'],
              }
            : {
                  [ChainId.Mainnet]: [
                      'https://damp-holy-water.quiknode.pro/d5bcb6c5e265afd11fecb0d52275afa961487a29/',
                      'https://mainnet.infura.io/v3/50676f4e9b9d4780a34fc8a503ff7f4f',
                      'https://throbbing-blue-bird.quiknode.io/73e66978-1a45-4f91-97f3-25d59b51a00e/YScEAjYfzZqNphokjzn-Zt3sZsOd0Nav5sauA3j03se0LOseR8PQFyBfINzhYStWrg44VfLLfCFE34FR2CA_kQ==/',
                      'http://api.taichi.network:10000/rpc/112c84849b6014ce1b970d8b81e9bb4a',
                  ],
              },
    PROVIDER_WEIGHT_LIST: {
        [ChainId.Mainnet]:
            process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test' || process.env.build === 'beta'
                ? [0, 0, 0, 0, 0] // 0 - 100%
                : [0, 0, 1, 2, 3], // 0 - 40%, 1 - 20%, 2 - 20%, 3 - 20%
    },
}
