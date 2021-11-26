import classNames from 'classnames'
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import { Table, TableBody, TableRow, TableCell, Typography, makeStyles, Theme, createStyles } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { unreachable } from '../../../utils/utils'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { IconsURLs } from '../../../resources/icons'

import { experimentalStyled as styled } from '@material-ui/core'

const TableCellBg = styled(TableCell)`
    width: 25px;
    vertical-align: center;
    img {
        width: 16px;
        display: inline-block;
        margin-top: 5px;
    }
`

const useDatabasePreviewCardStyles = makeStyles((theme: Theme) =>
    createStyles({
        table: {
            borderCollapse: 'unset',
        },
        cell: {
            border: 'none',
            padding: '9px 0 !important',
        },
        label: {
            verticalAlign: 'middle',
            fontSize: 16,
            fontWeight: 500,
            lineHeight: 1.75,
        },
        icon: {
            color: theme.palette.divider,
            width: 20,
            height: 20,
            verticalAlign: 'middle',
            marginLeft: 18,
        },
        iconChecked: {
            color: theme.palette.success.main,
        },
    }),
)

export enum DatabaseRecordType {
    Persona,
    Profile,
    Post,
    Group,
    Wallet,
}

export interface DatabasePreviewCardProps
    extends withClasses<KeysInferFromUseStyles<typeof useDatabasePreviewCardStyles>> {
    dense?: boolean
    records: {
        type: DatabaseRecordType
        length: number
        checked: boolean
    }[]
}

export function DatabasePreviewCard(props: DatabasePreviewCardProps) {
    const { dense = false, records } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useDatabasePreviewCardStyles(), props)

    const resolveRecordName = (type: DatabaseRecordType) => {
        switch (type) {
            case DatabaseRecordType.Persona:
                return t('personas')
            case DatabaseRecordType.Profile:
                return t('profiles')
            case DatabaseRecordType.Post:
                return t('posts')
            case DatabaseRecordType.Group:
                return t('groups')
            case DatabaseRecordType.Wallet:
                return t('wallets')
            default:
                return unreachable(type)
        }
    }
    const resolvedRecords = records.map((record) => ({
        ...record,
        name: resolveRecordName(record.type),
    }))

    const resolveRecordImg = (type: DatabaseRecordType) => {
        console.log('=type===', type)
        switch (type) {
            case DatabaseRecordType.Persona:
                return IconsURLs.persona.image
            case DatabaseRecordType.Profile:
                return IconsURLs.profiles.image
            case DatabaseRecordType.Post:
                return IconsURLs.posts.image
            case DatabaseRecordType.Group:
                return IconsURLs.Groups.image
            case DatabaseRecordType.Wallet:
                return IconsURLs.wallets.image
            default:
                return unreachable(type)
        }
    }
    return (
        <Table className={classes.table} size="small">
            <TableBody>
                {resolvedRecords.map((record) => (
                    <TableRow key={record.name}>
                        <TableCellBg className={classes.cell} component="th" align="left">
                            <img src={resolveRecordImg(record.type)} alt="" />
                        </TableCellBg>
                        <TableCell className={classes.cell} component="th" align="left">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.name}
                            </Typography>
                        </TableCell>
                        <TableCell className={classes.cell} align="right">
                            <Typography className={classes.label} variant="body2" component="span">
                                {record.length}
                            </Typography>
                            {!dense ? (
                                record.checked ? (
                                    <CheckCircleOutlineIcon className={classNames(classes.icon, classes.iconChecked)} />
                                ) : (
                                    <RadioButtonUncheckedIcon className={classes.icon} />
                                )
                            ) : null}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
