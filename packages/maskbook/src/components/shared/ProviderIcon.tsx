import { SubDAOIcon } from '../../resources/MaskbookIcon'
import { PolkadotIcon } from '../../resources/PolkadotIcon'
import { KusamaIcon } from '../../resources/KusamaIcon'
import { makeStyles, Theme } from '@material-ui/core'
import { ProviderType } from '../../web3/types'
import { useStylesExtends } from '../custom-ui-helper'

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        fontSize: 40,
        width: 40,
        height: 40,
    },
}))

export interface ProviderIconProps extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    size?: number
    providerType?: ProviderType
}

export function ProviderIcon(props: ProviderIconProps) {
    const { size = 40, providerType } = props
    const classes = useStylesExtends(useStyles(), props)

    switch (providerType) {
        case ProviderType.SubDAO:
            return <SubDAOIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.Polkadot:
            return <PolkadotIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        case ProviderType.Kusama:
            return <KusamaIcon classes={{ root: classes.icon }} viewBox={`0 0 ${size} ${size}`} />
        default:
            return null
    }
}
