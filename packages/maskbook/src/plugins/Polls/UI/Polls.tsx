import { useState } from 'react'
import { makeStyles, Button, createStyles, Card, Typography, CircularProgress, List, ListItem } from '@material-ui/core'
import { isValid, formatDistance } from 'date-fns'
import { zhCN, enUS, ja } from 'date-fns/locale'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { languageSettings } from '../../../settings/settings'
import type { PollGunDB } from '../Services'
import { PollStatus } from '../types'
import { useVoteData } from '../hooks/useVoteData'
import VoteChoiseDialog from './VoteChoiseDialog'
import ExectueVoteDialog from './ExectueVoteDialog'
import Services from '../../../extension/service'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
            padding: theme.spacing(2),
        },
        line: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
        },
        statusText: {
            margin: '3px',
            fontSize: '13px',
            color: theme.palette.primary.main,
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
        text: {
            zIndex: 101,
            lineHeight: '28px',
            margin: '0 4px',
        },
        deadline: {
            display: 'flex',
            color: '#657786',
        },
        flexOne: {
            flex: '1',
        },
    }),
)

interface PollCardProps {
    poll: PollGunDB
    onClick?(): void
    vote?(poll: PollGunDB, index: number): void
    hideVote?: boolean
    status?: PollStatus
}

export function PollCardUI(props: PollCardProps) {
    const { poll, onClick, vote, status, hideVote } = props
    const classes = useStyles()
    const isClosed = Date.now() > poll.end_time ? true : false
    const { t } = useI18N()
    const { value: voteData, retry } = useVoteData(poll, isClosed, hideVote)
    const [open, setOpen] = useState<boolean>(false)
    const hasData = !!voteData
    const [openExcuteDialog, setOpenExcuteDialog] = useState<boolean>(false)
    const lang = useValueRef(languageSettings)

    const getDeadline = (date: number) => {
        const deadline = new Date(date)
        if (isValid(deadline)) {
            const localeMapping = () => {
                switch (lang) {
                    case 'en':
                        return enUS
                    case 'zh':
                        return zhCN
                    default:
                        return enUS
                }
            }
            const time = formatDistance(new Date(poll.start_time), new Date(poll.end_time), {
                locale: localeMapping(),
            })
            return t('plugin_poll_deadline', { time })
        } else {
            return t('plugin_poll_length_unknown')
        }
    }
    const totalVotes = poll.results.reduce(
        (accumulator: number, currentValue: number): number => accumulator + currentValue,
    )

    const renderPollStatusI18n = (status: PollStatus) => {
        switch (status) {
            case PollStatus.Inactive:
                return t('plugin_poll_status_inactive')
            case PollStatus.Voting:
                return t('plugin_poll_status_voting')
            case PollStatus.Voted:
                return t('plugin_poll_status_voted')
            default:
                return t('plugin_poll_status_closed')
        }
    }

    const handleVote = async () => {
        retry()
        setOpen(true)
    }

    const handleExectue = () => {
        retry()
        setOpenExcuteDialog(true)
    }

    const onClickVote = status === PollStatus.Voted ? undefined : () => handleVote()

    return (
        <Card className={classes.card} onClick={() => onClick?.()}>
            <Typography variant="h5" className={classes.line}>
                {!status || status === PollStatus.Inactive ? null : (
                    <>
                        <div style={{ fontSize: '16px' }}>{poll.question}</div>
                        <div className={classes.status}>
                            {status === PollStatus.Voting ? <CircularProgress size={18} /> : null}
                            <span className={classes.statusText}>{renderPollStatusI18n(status)}</span>
                        </div>
                    </>
                )}
            </Typography>
            <List>
                {hasData &&
                    poll.options.map((option, index) => (
                        <ListItem className={classes.option} key={index} onClick={onClickVote}>
                            <div
                                style={{
                                    display: 'flex',
                                }}>
                                <div
                                    className={classes.bar}
                                    style={{
                                        width: `${(poll.results[index] / totalVotes) * 100}%`,
                                    }}></div>
                                <div className={classes.text}>{option}</div>
                            </div>
                            {/* <div className={classes.text}>{poll.results[index]}</div> */}
                        </ListItem>
                    ))}
            </List>
            <Typography variant="body2" classes={{ root: classes.deadline }}>
                {hasData && isClosed ? (
                    <>
                        <span className={classes.flexOne}>{t('plugin_poll_status_closed')}</span>
                        {voteData?.executed === false && (
                            <>
                                <Button onClick={handleExectue} size="small" variant="contained">
                                    {t('plugin_poll_excute')}
                                </Button>
                            </>
                        )}
                        {voteData?.executed === true && `${t('executed')}`}
                    </>
                ) : !hasData ? (
                    <>{t('plugin_poll_status_inactive')}</>
                ) : (
                    <>{getDeadline(poll.end_time)}</>
                )}
            </Typography>
            {!hideVote && !!voteData?.vote_id && (
                <VoteChoiseDialog
                    key={voteData?.vote_id}
                    open={open}
                    poll={poll}
                    voteData={voteData}
                    vote={vote}
                    onDecline={() => setOpen(false)}
                    onConfirm={() => false}
                />
            )}
            {isClosed && voteData?.executed === false && (
                <ExectueVoteDialog
                    key={voteData?.vote_id}
                    open={openExcuteDialog}
                    poll={poll}
                    voteData={voteData}
                    onDecline={() => setOpenExcuteDialog(false)}
                    onConfirm={() => false}
                />
            )}
        </Card>
    )
}
