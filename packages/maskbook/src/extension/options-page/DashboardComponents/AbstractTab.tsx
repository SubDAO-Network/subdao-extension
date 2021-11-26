import { makeStyles } from '@material-ui/core/styles'
import { Theme, createStyles, Tabs, Tab, Box, BoxProps, Paper } from '@material-ui/core'

import { experimentalStyled as styled } from '@material-ui/core'

const PaperBg = styled(Paper)``

const useStyles = makeStyles((theme: Theme) => {
    const dark = theme.palette.mode === 'dark'
    return createStyles({
        tab: {
            minWidth: 'unset',
        },
        tabSelected: {
            background: dark ? '#313768' : '#FFF3F9',
        },
        tabPanel: {
            marginTop: theme.spacing(3),
            display: 'flex',
            flexDirection: 'column',
            height: 230,
            overflowY: 'auto',
            background: '#F7F8FB',
        },
    })
})

interface TabPanelProps extends BoxProps {
    id?: string
    label: string
}

export interface AbstractTabProps {
    tabs: Omit<TabPanelProps, 'height' | 'minHeight'>[]
    state: readonly [number, (next: number) => void]
    margin?: true | 'top' | 'bottom'
    height?: number | string
}

export default function AbstractTab({ tabs, state, height = 200 }: AbstractTabProps) {
    const classes = useStyles()
    const [value, setValue] = state
    const tabIndicatorStyle = tabs.length ? { width: 100 / tabs.length + '%', height: 2 } : undefined

    return (
        <>
            <Paper elevation={0}>
                <Tabs
                    value={value}
                    TabIndicatorProps={{ style: tabIndicatorStyle }}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(_: React.SyntheticEvent, newValue: number) => setValue(newValue)}>
                    {tabs.map((tab) => (
                        <Tab
                            className={classes.tab}
                            classes={{
                                selected: classes.tabSelected,
                            }}
                            label={tab.label}
                            key={tab.label}
                            data-testid={`${tab.id?.toLowerCase()}_tab`}
                        />
                    ))}
                </Tabs>
            </Paper>
            <Box
                className={classes.tabPanel}
                role="tabpanel"
                {...tabs.find((_, index) => index === value)}
                sx={{
                    minHeight: height,
                }}
            />
        </>
    )
}
