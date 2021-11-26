import { useState, useRef, useEffect } from 'react'
import { useDropArea } from 'react-use'
import { makeStyles, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { RestoreBox } from './RestoreBox'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { QRCodeImageScanner } from './QRCodeImageScanner'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            width: '100%',
            height: 230,
        },
        file: {
            display: 'none',
        },
        qr: {
            maxWidth: 211,
            maxHeight: 211,
            display: 'block',
        },
        restoreBoxRoot: {
            boxSizing: 'border-box',
            // border: `solid 1px ${theme.palette.divider}`,
            background: '#F7F8FB',
            display: 'flex',
            justifyContent: 'center',
            height: 230,
            marginBottom: 16,
            borderRadius: 4,
        },
        restoreBoxPlaceholder: {
            marginTop: 0,
            marginBottom: 6,
        },
        qrcode: {
            width: 200,
            height: 200,
        },
    }),
)

export interface RestoreFromQRCodeImageBoxProps extends withClasses<never> {
    file: File | null
    onScan?: (content: string) => void
    onError?: () => void
    onChange?: (file: File | null) => void
}

export function RestoreFromQRCodeImageBox(props: RestoreFromQRCodeImageBoxProps) {
    const { file, onScan, onError, onChange } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [dataURL, setDataURL] = useState('')

    const inputRef = useRef<HTMLInputElement>(null)
    const [bound, { over }] = useDropArea({
        onFiles(files) {
            onChange?.(files[0])
        },
    })

    // read file as data URL
    useEffect(() => {
        if (file) {
            const fr = new FileReader()
            fr.readAsDataURL(file)
            fr.addEventListener('loadend', () => setDataURL(fr.result as string))
            fr.addEventListener('error', () => setDataURL(''))
        } else {
            setDataURL('')
        }
    }, [file])

    // invoke onChange callback
    useEffect(() => onChange?.(file), [file, onChange])

    return (
        <div className={classes.root} {...bound}>
            <input
                className={classes.file}
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
                    if (currentTarget.files) onChange?.(currentTarget.files.item(0))
                }}
            />
            <RestoreBox
                classes={{ root: classes.restoreBoxRoot, placeholder: classes.restoreBoxPlaceholder }}
                file={file}
                entered={over}
                enterText={t('restore_database_advance_dragging')}
                leaveText={t('restore_database_advance_dragged')}
                darkPlaceholderImageURL={new URL('./RestoreFromQRCodeImageBox-dark.png', import.meta.url).toString()}
                lightPlaceholderImageURL={new URL('./QR_Code.png', import.meta.url).toString()}
                data-active={over}
                onClick={() => inputRef.current && inputRef.current.click()}>
                {file ? (
                    <QRCodeImageScanner src={dataURL} onScan={onScan} onError={onError} className={classes.qrcode} />
                ) : null}
            </RestoreBox>
        </div>
    )
}
