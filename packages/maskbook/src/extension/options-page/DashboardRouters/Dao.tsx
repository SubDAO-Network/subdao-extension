import { useState, useCallback, useEffect } from 'react'
import DashboardRouterContainer, { ContainerLoading } from './Container'
import { Link, useParams } from 'react-router-dom'
import {
    Box,
    Button,
    Divider,
    TextField,
    Tabs,
    Tab,
    IconButton,
    Typography,
    experimentalStyled as styled,
} from '@material-ui/core'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import ClearIcon from '@material-ui/icons/Clear'
import SearchIcon from '@material-ui/icons/Search'
import AutoResize from 'react-virtualized-auto-sizer'
import { DaoLine } from '../DashboardComponents/DaoLine'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FixedSizeList } from 'react-window'
import { useAsyncFn, useMap } from 'react-use'
import Services from '../../service'
import type { Profile } from '../../../database'
import { last } from 'lodash-es'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardContactSearchDialog } from '../DashboardDialogs/Contact'
import { DashboardRoute } from '../Route'
import { useDaoPartners } from '../../../polkadot/hooks/useDaoPartners'
import { useAllVotes, VotingData } from '../../../polkadot/hooks/useAllVotes'
import { format } from 'date-fns'

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            fontWeight: 300,
            margin: theme.spacing(3, 0),
            color: theme.palette.text.secondary,
            [theme.breakpoints.down('sm')]: {
                margin: theme.spacing(2, 0),
            },
        },
        titleBox: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        caption: {
            padding: theme.spacing(2, 0),
        },
        progress: {
            width: '1.5em',
            height: '1.5em',
            marginRight: '0.75em',
        },
        list: {
            height: '100%',
            [theme.breakpoints.down('sm')]: {
                marginLeft: theme.spacing(-2),
                marginRight: theme.spacing(-2),
            },
            marginTop: theme.spacing(1.25),
        },
        empty: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        create: {
            marginTop: 30,
        },
    }),
)

const TypoHeader = styled(Typography)(
    ({ theme }) => `
    font-size: ${theme.typography.pxToRem(15)};
    font-weight: ${theme.typography.fontWeightRegular};
`,
)
const TypeLine = styled(Typography)(
    ({ theme }) => `
    font-size: ${theme.typography.pxToRem(12)};
`,
)
const Line = styled('div')(
    ({ theme }) => `
    font-size: ${theme.typography.pxToRem(12)};
    border: 1px solid ${theme.palette.text.hint};
    border-radius: ${theme.spacing(1)};
    padding: ${theme.spacing(1)};
    & + & {
        margin-top: ${theme.spacing(1)};
    }
`,
)
const LinkBack = styled(Link)(
    ({ theme }) => `
    margin: ${theme.spacing(3, 0)};
    color: ${theme.palette.primary.main};
    ${[theme.breakpoints.down('sm')]}: {
        margin: ${theme.spacing(2, 0)}
    };
`,
)
const FlexContainer = styled('div')(
    ({ theme }) => `
    display: flex;
`,
)
const LeftC = styled('div')(
    ({ theme }) => `
    min-width: 300px;
`,
)
const RightC = styled('div')(
    ({ theme }) => `
    width: 100%;
    padding: ${theme.spacing(2)};
    margin: 0;
    margin-left: ${theme.spacing(2)};
    border: 1px solid ${theme.palette.text.hint};
    border-radius: 8px;
`,
)
const ContentBox = styled(Box)(
    ({ theme }) => `
    flex: 1;
`,
)

const AccordionContainer = styled(Accordion)(
    ({ theme }) => `
    &:last-child {
        margin-bottom: ${theme.spacing(2)};
    }
`,
)

const TypoName = styled(Typography)(
    ({ theme }) => `
    font-size: ${theme.typography.pxToRem(12)};
    margin: 0;
`,
)
const TypoValue = styled(Typography)(
    ({ theme }) => `
    margin: 0;
    font-weight: 600;
`,
)
const ItemContainer = styled('div')(
    ({ theme }) => `
`,
)
const SpanOptionName = styled('span')(
    ({ theme }) => `
    display: inline-block;
    padding: ${theme.spacing(0.5, 0)};
    min-width: ${theme.typography.pxToRem(100)};
`,
)
const SpanOptionValue = styled('span')(
    ({ theme }) => `
    flex: 1;
    padding: ${theme.spacing(0.5, 0)};
    min-width: ${theme.typography.pxToRem(200)};
    text-align: right;
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

function OptionItem(props: ItemProps): React.ReactElement {
    return (
        <FlexContainer>
            <SpanOptionName>{props.name}</SpanOptionName>
            <SpanOptionValue>{props.value}</SpanOptionValue>
        </FlexContainer>
    )
}

export function DashboardDaoRouterItem() {
    const { t } = useI18N()
    const { address } = useParams<{ address: string }>()
    const { value: daoData, loading } = useDaoPartners(true, true)
    const [expandNumber, setExpandNumber] = useState<number>(-1)
    const classes = useStyles()
    const { daoInfo: items } = daoData
    const daoInfo = items.find((i) => i.address === address)

    const { value: votes, loading: loadingVotes } = useAllVotes(daoInfo?.daoAddresses?.vote_addr ?? '')
    const title = loading ? `${t('dao')}...` : `${t('dao')}: ${daoInfo?.name}`

    const [tabIndex, setTabIndex] = useState(0)
    const onTabChange = useCallback((_, newTabIndex: number) => {
        setTabIndex(newTabIndex)
    }, [])
    return (
        <DashboardRouterContainer navHeight={150} title={title} empty={votes?.length === 0}>
            <ContainerLoading loading={loading}>
                <Box
                    className={classes.caption}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                        <Tabs value={tabIndex} indicatorColor="primary" textColor="primary" onChange={onTabChange}>
                            <Tab label={t('vote')}></Tab>
                        </Tabs>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                        }}>
                        <LinkBack to={DashboardRoute.Dao}>{t('back')}</LinkBack>
                    </Box>
                </Box>
                <ContentBox>
                    {tabIndex === 0 ? (
                        <ContainerLoading loading={loadingVotes}>
                            {votes?.map((vote: VotingData, index: number) => (
                                <AccordionContainer
                                    expanded={index === expandNumber}
                                    key={vote.vote_id}
                                    onChange={() => {
                                        if (index === expandNumber) {
                                            setExpandNumber(-1)
                                        } else {
                                            setExpandNumber(index)
                                        }
                                    }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content">
                                        <TypoHeader>{`${vote.vote_id}: ${vote.title}`}</TypoHeader>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <FlexContainer>
                                            <LeftC>
                                                <Line>
                                                    <ItemName
                                                        name={t('vote_start_time')}
                                                        value={format(vote.start_date, 'yyyy-MM-dd HH:mm')}
                                                    />
                                                </Line>
                                                <Line>
                                                    <ItemName
                                                        name={t('vote_end_tiem')}
                                                        value={format(
                                                            Date.parse(vote.start_date.toString()) + vote.vote_time,
                                                            'yyyy-MM-dd HH:mm',
                                                        )}
                                                    />
                                                </Line>
                                                <Line>
                                                    <ItemName
                                                        name={t('plugin_poll_vote_number')}
                                                        value={vote.support_require_num.toString()}
                                                    />
                                                </Line>
                                                <Line>
                                                    <ItemName
                                                        name={t('plugin_poll_vote_min_number')}
                                                        value={vote.min_require_num.toString()}
                                                    />
                                                </Line>
                                            </LeftC>
                                            <RightC>
                                                {t('plugin_poll_options_hint')}:
                                                <div>
                                                    {vote.vote_items.options.map((item, index) => {
                                                        return (
                                                            <OptionItem
                                                                key={index}
                                                                name={item.name}
                                                                value={item.vote_number.toString()}></OptionItem>
                                                        )
                                                    })}
                                                </div>
                                                <Divider />
                                                <OptionItem
                                                    name={t('vote_total_numver')}
                                                    value={vote.vote_items.total_number.toString()}
                                                />
                                            </RightC>
                                        </FlexContainer>
                                    </AccordionDetails>
                                </AccordionContainer>
                            ))}
                        </ContainerLoading>
                    ) : null}
                </ContentBox>
            </ContainerLoading>
        </DashboardRouterContainer>
    )
}

export default function DashboardDaoRouter() {
    const { value: daoData, loading } = useDaoPartners(true, true)
    const { daoInfo: items } = daoData
    const { t } = useI18N()
    const classes = useStyles()
    const isEmpty = items.length === 0

    return (
        <DashboardRouterContainer navHeight={150} title={t('dao')}>
            <ContainerLoading loading={loading}>
                <div className={classes.titleBox}>
                    <Typography className={classes.title} variant="body2">
                        {t('dao_in_org')}
                    </Typography>
                    {!loading && !isEmpty ? (
                        <Button size="medium" variant="contained" href={t('create_dao_href')}>
                            {t('create_dao')}
                        </Button>
                    ) : null}
                </div>

                {!loading && isEmpty ? (
                    <div className={classes.empty}>
                        <img src={new URL('./dashboard-placeholder.png', import.meta.url).toString()}></img>
                        <Button
                            className={classes.create}
                            size="medium"
                            variant="contained"
                            href={t('create_dao_href')}>
                            {t('create_dao')}
                        </Button>
                    </div>
                ) : (
                    <section className={classes.list}>
                        <AutoResize>
                            {(sizeProps) => (
                                <FixedSizeList
                                    overscanCount={5}
                                    onItemsRendered={(data) => {
                                        if (isEmpty) return
                                    }}
                                    itemSize={104}
                                    itemCount={items.length}
                                    {...sizeProps}>
                                    {({ index, style }) =>
                                        items[index] ? (
                                            <DaoLine style={style as any} key={index} daoInfo={items[index]} />
                                        ) : null
                                    }
                                </FixedSizeList>
                            )}
                        </AutoResize>
                    </section>
                )}
            </ContainerLoading>
        </DashboardRouterContainer>
    )
}
