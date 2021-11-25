import classNames from 'classnames'
import { makeStyles } from '@material-ui/core'
import DoneIcon from '@material-ui/icons/Done'
import Chip, { ChipProps } from '@material-ui/core/Chip'

export interface ClickableChipProps extends ChipProps {
    checked?: boolean
}

const useStyles = makeStyles({
    base: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
        backgroundColor: '#F8F8F8',
        border: '1px solid #E5E5E5',
    },
    root: {
        marginRight: 6,
        marginBottom: 6,
        cursor: 'pointer',
    },
    icon: {
        backgroundColor: 'transparent !important',
    },
    label: {
        display: 'flex',
    },
})

export function ClickableChip(props: ClickableChipProps) {
    const classes = useStyles()
    return (
        <Chip
            color={props.checked ? 'primary' : 'default'}
            {...props}
            classes={{
                ...props.classes,
                root: props.checked ? classes.root : classes.base,
                label: classNames(classes.label, props.classes?.label),
            }}
        />
    )
}
