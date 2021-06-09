import { useAsyncRetry } from 'react-use'
import { useSubRedPacketContract } from '../contracts/useSubRedPacketContract'
import Services from '../../../extension/service'

export function useAvailability(id: string) {
    const { value: redPacketContract } = useSubRedPacketContract()
    return useAsyncRetry(async () => {
        if (!id) return null
        if (!redPacketContract) return null
        return await Services.Polkadot.checkRedPacket(id)
    }, [id, redPacketContract])
}
