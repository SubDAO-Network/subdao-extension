import { useState, useCallback, useEffect } from 'react'
import DashboardRouterContainer, { ContainerLoading } from './Container'
import { Link, useParams } from 'react-router-dom'
import { Box, Button, Tabs, Tab, List, ListItem, Typography, experimentalStyled as styled } from '@material-ui/core'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import AutoResize from 'react-virtualized-auto-sizer'
import { DaoLine } from '../DashboardComponents/DaoLine'
import { useI18N } from '../../../utils/i18n-next-ui'
import { FixedSizeList } from 'react-window'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardRoute } from '../Route'
import { useDaoPartners } from '../../../polkadot/hooks/useDaoPartners'
import { useAllVotes, VotingData } from '../../../polkadot/hooks/useAllVotes'
import { VoteDetailDialog } from '../DashboardDialogs/Vote'

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
        voteItem: {
            height: 70,
            borderTop: '1px solid #E7EAF3',
            '&:hover': {
                backgroundColor: '#F7F7F7',
            },
            padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
            flexDirection: 'row',
            justifyContent: 'space-between',
            '&:last-child': {
                borderBottom: '1px solid #E7EAF3',
            },
        },
    }),
)

const TypoHeader = styled(Typography)(
    ({ theme }) => `
    font-size: 14px;
    font-weight: 300;
    color: ${theme.palette.text.primary};
    line-height: 16px;
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
const ContentBox = styled(Box)(
    ({ theme }) => `
    flex: 1;
`,
)

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
    const [voteDetail, , openVoteDetail] = useModal(VoteDetailDialog)

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
                            <List>
                                {votes?.map((vote: VotingData) => (
                                    <ListItem
                                        key={vote.vote_id}
                                        classes={{ root: classes.voteItem }}
                                        onClick={() => openVoteDetail({ vote })}>
                                        <Box>
                                            <TypoHeader>{t('vote_title')}</TypoHeader>
                                            <TypoHeader>{vote.title}</TypoHeader>
                                        </Box>
                                        <ArrowForwardIosIcon style={{ marginRight: -10, fontSize: 10 }} />
                                    </ListItem>
                                ))}
                            </List>
                        </ContainerLoading>
                    ) : null}
                </ContentBox>
                {voteDetail}
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
