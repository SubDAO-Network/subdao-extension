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
            border: 0,
        },
        '& .MuiInputBase-input': {
            paddingTop: '12px',
            paddingBottom: '12px',
            background: '#F7F8FB',
            border: '2px solid #F7F8FB',
        },
        '& .Mui-focused': {
            '& .MuiInputBase-input': {
                background: 'transparent!important',
                border: '2px solid rgba(213, 17, 114, 0.2)',
                borderRadius: 4,
            },
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
