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
} from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import { add as addDate } from 'date-fns'
import { usePortalShadowRoot } from '@subdao/maskbook-shared'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import AbstractTab, { AbstractTabProps } from '../../../extension/options-page/DashboardComponents/AbstractTab'
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
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        item: {
            flex: 1,
            margin: theme.spacing(1),
        },
        pollWrap: {
            border: '1px solid #ccd6dd',
            borderRadius: '10px',
            margin: theme.spacing(1),
            padding: theme.spacing(1),
        },
        optionsWrap: {
            position: 'relative',
            '& >div': {
                width: '80%',
                margin: theme.spacing(2),
            },
        },
        addButton: {
            position: 'absolute',
            bottom: '0',
            right: '10px',
        },
        loading: {
            position: 'absolute',
            left: '50%',
            top: '50%',
        },
        whiteColor: {
            color: '#fff',
        },
    }),
)

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
                MenuProps={{
                    container: props.DialogProps?.container ?? container,
                    PaperProps: {
                        style: {
                            maxHeight: '300px',
                        },
                    },
                }}
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
                <TextField
                    label={t('plugin_poll_question_hint')}
                    variant="filled"
                    onChange={(e) => {
                        setQuestion((e.target as HTMLInputElement)?.value)
                    }}
                />
            </FormControl>
            <div className={classes.pollWrap}>
                <div className={classes.optionsWrap}>
                    {options.map((option, index) => (
                        <FormControl className={classes.line} key={index}>
                            <TextField
                                label={`${t('plugin_poll_options_hint')}${index + 1}`}
                                variant="filled"
                                onChange={(e) => {
                                    handleOptionsInput(index, (e.target as HTMLInputElement)?.value)
                                }}
                            />
                        </FormControl>
                    ))}
                    <IconButton onClick={addNewOption} classes={{ root: classes.addButton }}>
                        <AddIcon color="primary" />
                    </IconButton>
                </div>
                <Divider light />
                <Typography variant="h6" className={classes.line}>
                    {t('plugin_poll_length')}
                </Typography>
                <div className={classes.line}>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_days')}</InputLabel>
                        {useTimeSelect(31, setDays, days)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_hours')}</InputLabel>
                        {useTimeSelect(25, setHours, hours)}
                    </FormControl>
                    <FormControl variant="filled" className={classes.item}>
                        <InputLabel>{t('plugin_poll_length_minutes')}</InputLabel>
                        {useTimeSelect(61, setMinutes, minutes)}
                    </FormControl>
                </div>
                <Divider light />
                <Typography variant="h6" className={classes.line}>
                    {t('plugin_poll_select_dao')}
                </Typography>
                <div className={classes.line}>
                    <FormControl variant="filled" className={classes.item}>
                        {useDaoSelect(loadingDao, daoData?.daoInfo)}
                    </FormControl>
                </div>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header">
                        <Typography className={classes.heading}>{t('post_dialog__more_options_title')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormControl variant="filled" className={classes.item}>
                            <TextField
                                label={t('plugin_poll_vote_number')}
                                variant="filled"
                                type="number"
                                onChange={(e) => {
                                    setVoteNumber(Number(e.target?.value))
                                }}
                            />
                        </FormControl>
                        <FormControl variant="filled" className={classes.item}>
                            <TextField
                                label={t('plugin_poll_vote_min_number')}
                                variant="filled"
                                type="number"
                                onChange={(e) => {
                                    setMinVoteNumber(Number(e.target?.value))
                                }}
                            />
                        </FormControl>
                    </AccordionDetails>
                </Accordion>
            </div>
            <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                <Button
                    color="primary"
                    variant="contained"
                    disabled={loading || loadingDao || !voteAddress}
                    startIcon={
                        loading || loadingDao ? (
                            <CircularProgress classes={{ root: classes.whiteColor }} size={24} />
                        ) : null
                    }
                    style={{ color: '#fff' }}
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
                polls.map((p) => <PollCardUI onClick={() => insertPoll(p)} poll={p} key={p.key as string} hideVote />)
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
                    <AbstractTab height={600} {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        </ThemeProvider>
    )
}
