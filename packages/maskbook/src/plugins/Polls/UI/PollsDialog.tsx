import { useState, useEffect } from 'react'
import {
    makeStyles,
    createStyles,
    DialogContent,
    DialogProps,
    Typography,
    IconButton,
    Button,
    InputLabel,
    TextField,
    FormControl,
    Select,
    MenuItem,
    Divider,
    CircularProgress,
    ThemeProvider,
    experimentalStyled as styled,
    InputBase,
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { add as addDate } from 'date-fns'
import { usePortalShadowRoot } from '@subdao/maskbook-shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { AbstractTabProps, InjectAbstractTab } from '../../../extension/options-page/DashboardComponents/AbstractTab'
import { editActivatedPostMetadata } from '../../../protocols/typed-message/global-state'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import type { PollGunDB } from '../Services'
import { PollCardUI } from './Polls'
import type { PollMetaData } from '../types'
import { POLL_META_KEY_1 } from '../constants'
import { useI18N } from '../../../utils/i18n-next-ui'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { PluginPollRPC } from '../utils'
import { first, get } from 'lodash-es'
import { useAllVotes } from '../hooks/useAllVotes'
import Services from '../../../extension/service'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useDaoPartners, DaoInfo } from '../../../polkadot/hooks/useDaoPartners'
import type { DaoAddresses } from '../../../polkadot/types'
import { useMaskbookTheme } from '../../../utils/theme'
import classNames from 'classnames'

const useNewPollStyles = makeStyles((theme) =>
    createStyles({
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        menu: {
            width: theme.typography.pxToRem(300),
            overflow: 'hidden',
            textDecoration: 'none',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        },
        line: {
            display: 'flex',
            marginBottom: 15,
        },
        pollWrap: {
            display: 'flex',
        },
        pollItem: {
            flex: 1,
            position: 'relative',
        },
        selectBox: {
            width: '100%',
            '&:before': {
                borderBottom: 0,
            },
            '&:after': {
                borderBottom: 0,
            },
        },
        pollItemCenter: {
            flex: 1,
            margin: '0 10px',
            position: 'relative',
        },
        pollSelect: {
            background: ' #F8F8F8',
            border: '1px solid #E5E5E5',
            height: 40,
            padding: 0,
            lineHeight: '40px',
            fontWeight: 400,
        },
        pollInput: {
            textAlign: 'right',
        },
        pollLabel: {
            position: 'absolute',
            left: 8,
            zIndex: 1,
            height: '100%',
            fontSize: 12,
            fontWeight: 400,
            lineHeight: '40px',
            color: 'rgba(33, 33, 33, 0.4)',
        },
        optionsWrap: {
            marginBottom: 15,
            position: 'relative',
            '& > div:first-child': {
                marginBottom: theme.spacing(1),
            },
        },
        addButton: {
            position: 'absolute',
            bottom: 4,
            right: -6,
        },
        loading: {
            position: 'absolute',
            left: '50%',
            top: '50%',
        },
        whiteColor: {
            color: '#fff',
        },
        inputBase: {
            background: '#F8F8F8',
            border: '1px solid #E5E5E5',
        },
        questionInput: {
            height: 70,
            padding: '12px 20px',
            lineHeight: '16px',
            color: '#212121',
            fontWeight: 400,
            '& textarea': {
                height: '100% !important',
            },
        },
        optionInput: {
            height: 40,
            width: 368,
            paddingLeft: 71,
            fontWeight: 400,
        },
        optionItem: {
            position: 'relative',
            marginBottom: theme.spacing(1),

            '& > div:last-child': {
                marginBottom: 0,
            },
        },
        optionHint: {
            fontSize: 14,
            height: '100%',
            position: 'absolute',
            left: 10,
            lineHeight: '40px',
            zIndex: 1,
            color: 'rgba(33, 33, 33, 0.4)',
        },
        daoSelect: {
            background: ' #F8F8F8',
            border: '1px solid #E5E5E5',
            height: 40,
            padding: 0,
            fontWeight: 400,
        },
        accordArea: {
            margin: '15px 0',
        },
        accord: {
            padding: 0,
        },
        accordItem: {
            marginBottom: 8,
        },
        accordInput: {
            height: 40,
            lineHeight: '40px',
            background: ' #F8F8F8',
            border: '1px solid #E5E5E5',
            paddingLeft: 10,
            fontWeight: 400,
        },
    }),
)

const InputTitle = styled(Typography)`
    font-weight: 400;
    color: rgba(33, 33, 33, 0.4);
    line-height: 14px;
    font-size: 12px;
    margin-bottom: 8px;
`

interface NewPollProps {
    loading: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    senderName: string | undefined
    senderFingerprint: string | undefined
    switchToCreateNewPoll: () => void
}

function NewPollUI(props: PollsDialogProps & NewPollProps) {
    const classes = useStylesExtends(useNewPollStyles(), props)
    const [loading, setLoading] = props.loading
    const [question, setQuestion] = useState('')
    const [options, setOptions] = useState<string[]>(['', ''])

    const [days, setDays] = useState(1)
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [voteNumber, setVoteNumber] = useState(1)
    const [minVoteNumber, setMinVoteNumber] = useState(1)
    const { value: daoData, loading: loadingDao } = useDaoPartners()
    const [baseAddress, setBaseAddress] = useState<string>('')
    const [voteAddress, setVoteAddress] = useState<string>('')
    const handleDaoChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const baseAddress = event.target.value as string
        const daoAddress = first(
            (daoData?.daoAddresses as DaoAddresses[]).filter((o: DaoAddresses) => baseAddress === o.base_addr),
        )
        const voteAdd = daoAddress?.vote_addr
        if (!voteAdd) {
            console.error('cannot find vote_addr for base_addr', baseAddress)
        }
        setBaseAddress(baseAddress)
        setVoteAddress(voteAdd || '')
    }

    const { t } = useI18N()

    const handleOptionsInput = (index: number, value: string) => {
        setOptions(options.map((option, i) => (i === index ? value : option)))
    }

    const addNewOption = () => {
        setOptions(options.concat(['']))
    }

    const sendPoll = async () => {
        const start_time = new Date()
        if (!voteAddress) {
            return
        }
        const end_time = addDate(start_time, {
            days,
            hours,
            minutes,
        })
        setLoading(true)
        const result: any = await Services.Polkadot.newVote({
            title: question,
            vote_time: String(end_time.getTime() - start_time.getTime()),
            support_require_num: voteNumber,
            min_require_num: minVoteNumber,
            choices: options.join('|'),
            vote_address: voteAddress,
        })
        if (!result.status.finalized) {
            setLoading(false)
            return
        }
        PluginPollRPC.createNewPoll({
            question,
            options,
            start_time,
            end_time,
            vote_address: voteAddress,
            sender: props.senderName,
            vote_id: `${Number(get(result, 'contractEvents[0].args[0]', 0))}`,
            id: props.senderFingerprint,
        }).then((res) => {
            setLoading(false)
            props.switchToCreateNewPoll()
        })
    }

    const useTimeSelect = (count: number, fn: (newVal: number) => void, defaultIndex = 0) => {
        const options = new Array(count).fill('')

        return usePortalShadowRoot((container) => (
            <Select
                className={classes.selectBox}
                MenuProps={{
                    container: props.DialogProps?.container ?? container,
                    PaperProps: {
                        style: {
                            maxHeight: '300px',
                        },
                    },
                }}
                classes={{ root: classes.pollSelect, select: classes.pollInput }}
                value={defaultIndex}
                onChange={(e) => fn(e.target.value as number)}>
                {options.map((item, index) => (
                    <MenuItem value={index} key={index}>
                        {index}
                    </MenuItem>
                ))}
            </Select>
        ))
    }
    const useDaoSelect = (loadingDao: boolean, daos: DaoInfo[]) => {
        return usePortalShadowRoot((container) => {
            if (loadingDao) {
                return <></>
            }
            return (
                <Select
                    MenuProps={{
                        container: props.DialogProps?.container ?? container,
                        PaperProps: {
                            style: {
                                maxHeight: '300px',
                            },
                        },
                    }}
                    className={classes.selectBox}
                    classes={{ root: classes.daoSelect }}
                    labelId="demo-customized-select-label"
                    id="demo-customized-select"
                    value={baseAddress}
                    onChange={handleDaoChange}>
                    {daos.map((dao: DaoInfo) => (
                        <MenuItem key={dao.address} value={dao.address}>
                            <span className={classes.menu}>{`${dao.name}: ${dao.desc}`}</span>
                        </MenuItem>
                    ))}
                </Select>
            )
        })
    }

    return (
        <>
            <FormControl className={classes.line}>
                <InputTitle>{t('plugin_poll_question_hint')}</InputTitle>
                <InputBase
                    className={classes.inputBase}
                    classes={{ root: classes.questionInput }}
                    multiline
                    rows={3}
                    onChange={(e) => {
                        setQuestion((e.target as HTMLInputElement)?.value)
                    }}
                />
            </FormControl>
            <div className={classes.optionsWrap}>
                <InputTitle>{t('plugin_poll_options')}</InputTitle>
                {options.map((option, index) => (
                    <div key={index} className={classes.optionItem}>
                        <div className={classes.optionHint}>
                            {t('plugin_poll_options_hint')}
                            {index + 1}
                        </div>
                        <InputBase
                            className={classes.inputBase}
                            classes={{ root: classes.optionInput }}
                            // label={`${t('plugin_poll_options_hint')}${index + 1}`}
                            onChange={(e) => {
                                handleOptionsInput(index, (e.target as HTMLInputElement)?.value)
                            }}
                        />
                    </div>
                ))}
                <IconButton onClick={addNewOption} classes={{ root: classes.addButton }}>
                    <AddIcon color="primary" />
                </IconButton>
            </div>
            <InputTitle>{t('plugin_poll_length')}</InputTitle>
            <div className={classNames(classes.line, classes.pollWrap)}>
                <div className={classes.pollItem}>
                    <span className={classes.pollLabel}>{t('plugin_poll_length_days')}</span>
                    {useTimeSelect(31, setDays, days)}
                </div>
                <div className={classes.pollItemCenter}>
                    <span className={classes.pollLabel}>{t('plugin_poll_length_hours')}</span>
                    {useTimeSelect(25, setHours, hours)}
                </div>
                <div className={classes.pollItem}>
                    <span className={classes.pollLabel}>{t('plugin_poll_length_minutes')}</span>
                    {useTimeSelect(61, setMinutes, minutes)}
                </div>
            </div>
            <InputTitle>{t('plugin_poll_select_dao')}</InputTitle>
            <div>{useDaoSelect(loadingDao, daoData?.daoInfo)}</div>
            <Accordion className={classes.accordArea}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                    <Typography className={classes.heading}>{t('post_dialog__more_options_title')}</Typography>
                </AccordionSummary>
                <AccordionDetails classes={{ root: classes.accord }}>
                    <div className={classes.accordItem}>
                        <InputTitle>{t('plugin_poll_vote_number')}</InputTitle>
                        <InputBase
                            classes={{ root: classes.accordInput }}
                            fullWidth
                            type="number"
                            onChange={(e) => {
                                setVoteNumber(Number(e.target?.value))
                            }}
                        />
                    </div>
                    <div className={classes.accordItem}>
                        <InputTitle>{t('plugin_poll_vote_min_number')}</InputTitle>
                        <InputBase
                            classes={{ root: classes.accordInput }}
                            fullWidth
                            type="number"
                            onChange={(e) => {
                                setMinVoteNumber(Number(e.target?.value))
                            }}
                        />
                    </div>
                </AccordionDetails>
            </Accordion>
            <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                <Button
                    size="medium"
                    color="primary"
                    variant="contained"
                    disabled={loading || loadingDao || !voteAddress}
                    startIcon={
                        loading || loadingDao ? (
                            <CircularProgress classes={{ root: classes.whiteColor }} size={24} />
                        ) : null
                    }
                    style={{ color: '#fff', marginTop: 26 }}
                    onClick={sendPoll}>
                    {t('plugin_poll_send_poll')}
                </Button>
            </div>
        </>
    )
}

interface ExistingPollsProps {
    onSelectExistingPoll(poll?: PollMetaData | null): void
    senderFingerprint: string | undefined
    state: any
}

function ExistingPollsUI(props: PollsDialogProps & ExistingPollsProps) {
    const [polls, setPolls] = useState<PollGunDB[]>([])
    const [loading, setLoading] = useState(false)
    const classes = useStylesExtends(useNewPollStyles(), props)
    const [tabNum, setTabNum] = props.state

    const {
        value: votes,
        error: maskBalanceError,
        loading: maskBalanceLoading,
        retry: maskBalanceRetry,
        // TODO find all vote
    } = useAllVotes('')

    useEffect(() => {
        setLoading(true)
        PluginPollRPC.getAllExistingPolls().then((polls) => {
            setLoading(false)
            const myPolls: PollGunDB[] = []
            polls.map((poll) => {
                if (poll.id === props.senderFingerprint) {
                    myPolls.push(poll)
                }
            })
            setPolls(myPolls.reverse())
        })
    }, [props.senderFingerprint])

    const insertPoll = (poll?: PollMetaData | null) => {
        setTabNum(0)
        props.onSelectExistingPoll(poll)
    }

    return (
        <div className={classes.wrapper}>
            {loading ? (
                <CircularProgress size={35} classes={{ root: classes.loading }} />
            ) : (
                polls.map((p) => <PollCardUI onClick={() => insertPoll(p)} poll={p} key={p.key as string} />)
            )}
        </div>
    )
}

const useStyles = makeStyles((theme) => {
    createStyles({
        title: {
            marginLeft: 6,
        },
        container: {
            width: '100%',
        },
    })
})

interface PollsDialogProps extends withClasses<'wrapper'> {
    open: boolean
    onConfirm: (opt?: any) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export default function PollsDialog(props: PollsDialogProps) {
    const defaultTheme = useMaskbookTheme()
    const classes = useStylesExtends(useStyles(), props)
    const state = useState(0)
    const [, setTabState] = state
    const loading = useState(false)

    const { t } = useI18N()

    const createNewPoll = () => {
        setTabState(1)
    }

    const insertPoll = (data?: PollMetaData | null) => {
        editActivatedPostMetadata((next) => (data ? next.set(POLL_META_KEY_1, data) : next.delete(POLL_META_KEY_1)))
        props.onConfirm()
    }

    const senderName = useCurrentIdentity()?.linkedPersona?.nickname
    const senderFingerprint = useCurrentIdentity()?.linkedPersona?.fingerprint

    const onClose = () => {
        setTabState(0)
        props.onDecline()
    }

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('plugin_poll_create_new'),
                children: (
                    <NewPollUI
                        {...props}
                        loading={loading}
                        switchToCreateNewPoll={createNewPoll}
                        senderName={senderName}
                        senderFingerprint={senderFingerprint}
                    />
                ),
                sx: { p: 0 },
            },
            {
                label: t('plugin_poll_select_existing'),
                children: (
                    <ExistingPollsUI
                        {...props}
                        state={state}
                        onSelectExistingPoll={insertPoll}
                        senderFingerprint={senderFingerprint}
                    />
                ),
                sx: { p: 0 },
            },
        ],
        state,
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <InjectedDialog open={props.open} onClose={onClose} title={t('plugin_poll_display_name')}>
                <DialogContent>
                    <InjectAbstractTab height={480} {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        </ThemeProvider>
    )
}
