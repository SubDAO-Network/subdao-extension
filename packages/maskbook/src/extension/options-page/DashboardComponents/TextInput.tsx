import { TextField, TextFieldProps, makeStyles } from '@material-ui/core'
import classNames from 'classnames'

const useStyles = makeStyles((theme) => ({
    root: {
        '&:first-child': {
            marginTop: theme.spacing(1.25),
            fontWeight: 300,
        },
        '& label': {
            fontSize: 18,
            transform: 'translate(-0, -6px) scale(0.75) !important',
            textAlign: 'left',
            position: 'inherit',
        },
        '& label text': {
            color: 'color: rgba(16, 22, 75, 0.6)',
        },
        '& fieldset': {
            top: 0,
        },
        '& .MuiInputBase-input': {
            paddingTop: '12px',
            paddingBottom: '12px',
        },
        '& legend': {
            display: 'none',
        },
    },
}))

export default function TextInput(_props: TextFieldProps) {
    const { className, ...props } = _props
    const classes = useStyles()
    return (
        <TextField
            {...props}
            className={classNames(className, classes.root)}
            InputLabelProps={{
                shrink: true,
                disableAnimation: true,
            }}
        />
    )
}
