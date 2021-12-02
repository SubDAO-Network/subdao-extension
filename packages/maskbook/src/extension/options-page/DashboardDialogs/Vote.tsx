import { Typography, Box, Button, Divider, experimentalStyled as styled } from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import { DashboardDialogCore, DashboardDialogWrapper, WrappedDialogProps } from './Base'
import type { VotingData } from '../../../polkadot/hooks/useAllVotes'
import { useI18N } from '../../../utils/i18n-next-ui'
import { format } from 'date-fns'

const useStyles = makeStyles((theme) =>
    createStyles({
        numberBox: {
            display: 'flex',
            flexDirection: 'row',
            '& > div:first-child': {
                marginRight: 11,
            },
            '& > div:last-child': {
                marginLeft: 11,
            },
            '& > div': {
                padding: theme.spacing(1.25),
            },
        },
        number: {
            fontWeight: 500,
            lineHeight: '21px',
        },
        numberLabel: {
            fontSize: 14,
            color: '#9C9EAC',
        },
    }),
)

const Line = styled('div')(
    ({ theme }) => `
        font-size: 14px;
        margin-bottom: 15px;
    `,
)

const LeftC = styled('div')(
    ({ theme }) => `
        text-align: left;
    `,
)

const Choice = styled(Box)(
    ({ theme }) => `
        margin-top: 15px;
        margin-bottom: ${theme.spacing(3)};
    `,
)

const ItemContainer = styled('div')(
    ({ theme }) => `
`,
)
const TypoName = styled(Typography)(
    ({ theme }) => `
        font-size: 14px;
        margin: 0;
        color: #9C9EAC;
        text-align: left;
    `,
)
const TypoValue = styled(Typography)(
    ({ theme }) => `
        font-size: 14px;
        margin: 0;
        color: ${theme.palette.text.primary}
    `,
)

interface ItemProps {
    name: string
    value: string
}
function ItemName(props: ItemProps): React.ReactElement {
    return (
        <ItemContainer>
            <TypoName>{props.name}</TypoName>
            <TypoValue>{props.value}</TypoValue>
        </ItemContainer>
    )
}

const FlexContainer = styled('div')(
    ({ theme }) => `
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 10px 0;
    `,
)
const OptionItemText = styled(Typography)(
    ({ theme }) => `
        font-size: 14px;
        font-weight: 300;
        color: ${theme.palette.text.primary};
    `,
)

function OptionItem(props: ItemProps): React.ReactElement {
    return (
        <FlexContainer>
            <OptionItemText>{props.name}</OptionItemText>
            <OptionItemText>{props.value}</OptionItemText>
        </FlexContainer>
    )
}

const NumberBox = styled(Box)(
    ({ theme }) => `
        width: 188px;
        height: 63px;
        background: #F9F9FC;
        border: 1px solid #EBEBEF;
        text-align: center;
    `,
)

export function VoteDetailDialog(props: WrappedDialogProps) {
    const { t } = useI18N()
    const vote: VotingData = props.ComponentProps.vote
    const classes = useStyles()

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                primary=""
                content={
                    <>
                        <LeftC>
                            <Line>
                                <ItemName name={t('vote_title')} value={vote.title} />
                            </Line>
                            <Line>
                                <ItemName
                                    name={t('vote_time_title')}
                                    value={
                                        format(vote.start_date, 'yyyy.MM.dd HH:mm') +
                                        ' - ' +
                                        format(
                                            Date.parse(vote.start_date.toString()) + vote.vote_time,
                                            'yyyy.MM.dd HH:mm',
                                        )
                                    }
                                />
                            </Line>
                            <Box className={classes.numberBox}>
                                <NumberBox>
                                    <Typography className={classes.number}>{vote.support_require_num}</Typography>
                                    <Typography className={classes.numberLabel}>{t('vote_support_requre')}</Typography>
                                </NumberBox>
                                <NumberBox>
                                    <Typography className={classes.number}>{vote.min_require_num}</Typography>
                                    <Typography className={classes.numberLabel}>{t('vote_min_requre')}</Typography>
                                </NumberBox>
                            </Box>
                        </LeftC>
                        <Choice>
                            <TypoName>{t('plugin_poll_options_hint')}</TypoName>
                            <div>
                                {vote.vote_items.options.map((item, index) => {
                                    return (
                                        <div key={index}>
                                            <OptionItem name={item.name} value={item.vote_number.toString()} />
                                            <Divider />
                                        </div>
                                    )
                                })}
                            </div>
                            <OptionItem name={t('vote_total_numver')} value={vote.vote_items.total_number.toString()} />
                            <Divider />
                        </Choice>
                    </>
                }
                footer={
                    <Button fullWidth variant="contained" onClick={props.onClose}>
                        {t('confirm')}
                    </Button>
                }
            />
        </DashboardDialogCore>
    )
}
