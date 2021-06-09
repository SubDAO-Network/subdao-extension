import { story } from '@subdao/maskbook-storybook-shared'
import { MaskAlert as C } from '../src/components/MaskAlert'

const { meta, of } = story(C)

export default meta({
    title: 'Components/SubDAO Alert',
})

export const MaskAlert = of({})
