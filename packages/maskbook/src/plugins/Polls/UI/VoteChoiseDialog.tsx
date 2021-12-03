import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import {
    createStyles,
    makeStyles,
    Card,
    DialogContent,
    DialogProps,
    Typography,
    experimentalStyled as styled,
    Button,
    Grid,
    CircularProgress,
    RadioGroup,
    Radio,
    FormControlLabel,
} from '@material-ui/core'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import type { PollGunDB } from '../Services'
import type { VoteData } from '../types'
import Services from '../../../extension/service'
import { formatChoices } from '../formatter'
import { formatDateTime } from '../../../utils/date'

const CardUI = styled(Card)`
    margin: 0 auto;
    width: 400px;
`
const TextRight = styled('span')`
    text-align: right;
`
const TextFlexOne = styled('span')`
    flex: 1;
`

const useStyles = makeStyles((theme) =>
    createStyles({
        line: {
            display: 'flex',
            margin: theme.spacing(1),
        },
        whiteColor: {
            color: '#fff',
        },
        option: {
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0, 1),
            height: '28px',
        },
        bar: {
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 100,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.6,
            minWidth: theme.spacing(1),
            height: '28px',
            borderRadius: theme.spacing(0.8),
        },
        labelRoot: {
            display: 'flex',
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            fontWeight: theme.typography.fontWeightRegular,
        },
        text: {
            zIndex: 101,
            lineHeight: '28px',
            margin: '0 4px',
        },
        fullWidth: {
            width: '100%',
        },
    }),
)

interface LabelChoiceProps {
    label: string
    vote_number: number
    total_number: number
}
function LabelChoice(props: LabelChoiceProps) {
    const classes = useStyles()
    const { t } = useI18N()
    const { label, vote_number, total_number } = props
    return (
        <div
            className={classes.option}
            style={{
                display: 'flex',
                width: '100%',
            }}>
            <div
                className={classes.bar}
                style={{
                    width: `${(vote_number / total_number) * 100}%`,
                }}></div>
            <div className={classes.text}>{label}</div>
            <div>{vote_number}</div>
        </div>
    )
}

interface LabelVoteDateProps {
    voteData: VoteData
}
function LabelVoteDate(props: LabelVoteDateProps) {
    const { voteData } = props
    const { t } = useI18N()
    const classes = useStyles()
    const start = voteData?.start_date?.replace(/,/g, '')
    const voteTime = voteData?.vote_time?.replace(/,/g, '')
    const date = new Date(Number(start) + Number(voteTime))
    return (
        <Typography className={classes.line}>
            <TextFlexOne>{t('plugin_poll_vote_ending_time')}</TextFlexOne>
            <TextRight>{formatDateTime(date)}</TextRight>
        </Typography>
    )
}

interface VoteChoiseDialogProps extends withClasses<'wrapper'> {
    poll: PollGunDB
    voteData: VoteData
    open: boolean
    vote?(poll: PollGunDB, index: number): void
    onConfirm: (opt?: any) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

export default function VoteChoiseDialog(props: VoteChoiseDialogProps) {
    const classes = useStyles()
    const { open, voteData, poll, vote } = props
    const { t } = useI18N()

    const [choiseId, setChoiseId] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)

    const handleChange = (event: React.SyntheticEvent) => {
        setChoiseId((event.target as HTMLInputElement).value)
    }
    const voteChoise = async () => {
        const voteId = voteData?.vote_id ?? ''
        const { vote_address } = poll
        setLoading(true)
        const res: any = await Services.Polkadot.voteChoice({ vote_address, voteId, choiseId })
        console.log(`vote choise ${choiseId}`)
        // if (res.status.finalized && res.contractEvents) {
        if (res.status.inBlock) {
            vote?.(poll, Number(choiseId))
            setLoading(false)
            props.onDecline()
        }
    }
    const { options: optionItems, total_number } = formatChoices(voteData?.choices)

    return (
        <InjectedDialog open={props.open} onClose={props.onDecline} title={t('plugin_poll_choise_dialog')}>
            <DialogContent>
                <CardUI>
                    <Typography variant="h4" className={classes.line}>
                        {voteData?.title}
                    </Typography>
                    <LabelVoteDate voteData={voteData} />
                    <RadioGroup name={voteData?.title} value={choiseId} onChange={handleChange}>
                        {optionItems?.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                classes={{
                                    label: classes.fullWidth,
                                }}
                                value={String(index)}
                                control={<Radio />}
                                label={
                                    <LabelChoice
                                        label={option?.name}
                                        vote_number={option?.vote_number}
                                        total_number={total_number}
                                    />
                                }
                            />
                        ))}
                    </RadioGroup>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header">
                            <Typography className={classes.heading}>{t('plugin_poll_condition')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {voteData?.support_require_num && (
                                <Typography className={classes.line}>
                                    {t('plugin_poll_vote_number')}
                                    {': '}
                                    {voteData?.support_require_num}
                                </Typography>
                            )}
                            {voteData?.min_require_num && (
                                <Typography className={classes.line}>
                                    {t('plugin_poll_vote_min_number')}
                                    {': '}
                                    {voteData?.min_require_num}
                                </Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </CardUI>
                <div className={classes.line} style={{ justifyContent: 'flex-end' }}>
                    <Button
                        color="primary"
                        variant="contained"
                        disabled={loading}
                        startIcon={
                            loading ? <CircularProgress classes={{ root: classes.whiteColor }} size={24} /> : null
                        }
                        style={{ color: '#fff' }}
                        onClick={() => voteChoise()}>
                        {loading ? t('plugin_poll_status_voting') : t('vote')}
                    </Button>
                </div>
            </DialogContent>
        </InjectedDialog>
    )
}
