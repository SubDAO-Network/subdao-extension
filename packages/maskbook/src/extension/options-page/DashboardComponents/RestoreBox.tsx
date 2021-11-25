import { makeStyles, useTheme, createStyles } from '@material-ui/core'
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import ActionButton from './ActionButton'

const useStyle = makeStyles((theme) =>
    createStyles({
        root: {
            color: theme.palette.text.hint,
            whiteSpace: 'pre-line',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: '0.4s',
            overflow: 'hidden',
            '&[data-active=true]': {
                color: 'black',
            },
        },
        icon: {
            top: 0,
            bottom: 0,
            left: 4,
            right: 'auto',
            margin: 'auto',
            position: 'absolute',
        },
        button: {
            maxWidth: '90%',
            position: 'relative',
            fontWeight: 300,
            color: '#10164B',
            marginTop: -20,
            '& > span:first-child': {
                display: 'inline-block',
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
            },
        },
        buttonText: {
            height: 28,
            lineHeight: 1,
            paddingTop: 0,
            paddingBottom: 0,
            '&:hover': {
                background: 'transparent',
            },
        },
        placeholder: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            width: 64,
            height: 64,
            margin: '20px auto',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: '64px 64px',
        },
        placeholderImage: {
            width: 35,
            height: 40,
        },
    }),
)

export interface RestoreBoxProps extends withClasses<never> {
    file: File | null
    entered: boolean
    enterText: string
    leaveText: string
    darkPlaceholderImageURL: string
    lightPlaceholderImageURL: string
    children?: React.ReactNode
    onClick?: () => void
}

export function RestoreBox(props: RestoreBoxProps) {
    const { entered, file, enterText, leaveText, children, onClick } = props
    const { darkPlaceholderImageURL, lightPlaceholderImageURL } = props
    const classes = useStylesExtends(useStyle(), props)
    const theme = useTheme()
    const src = theme.palette.mode === 'dark' ? darkPlaceholderImageURL : lightPlaceholderImageURL
    return (
        <div className={classes.root} data-active={entered} onClick={onClick}>
            <div className={classes.placeholder}>
                {children ? children : <img className={classes.placeholderImage} src={src} />}
            </div>
            <ActionButton
                className={classes.button}
                classes={{ text: classes.buttonText }}
                variant="text"
                disableRipple={true}
                style={{ paddingLeft: entered || file ? 8 : 28 }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}>
                {entered ? enterText : file ? file.name : leaveText}
            </ActionButton>
        </div>
    )
}
