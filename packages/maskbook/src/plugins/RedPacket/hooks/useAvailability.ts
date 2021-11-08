import { useAsyncRetry } from 'react-use'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import Services from '../../../extension/service'
import { ChainId } from '../../../web3/types'

export function useAvailability(id: string, chainId: ChainId) {
    const { value: redPacketContract } = useSubRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id) return null
        if (chainId === ChainId.Polkadot || chainId === ChainId.Kusama) {
            const info = await Services.Polkadot.checkDotOrKsmRedPacket(id)
            if (info && info.errCode === 0) {
                return info.data
            }
        } else {
            if (!redPacketContract) return null
            return await Services.Polkadot.checkRedPacket(id)
        }
    }, [id, redPacketContract, chainId])
}
