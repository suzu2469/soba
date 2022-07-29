import { NextPage } from 'next'
import { useState } from 'react'
import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import IconButton from '@mui/material/IconButton'
import CachedIcon from '@mui/icons-material/Cached'
import ExpandMore from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import AudioPlayer from '../../components/AudioPlayer'
import TrackList from '../../components/TrackList'
import FilteredTracks from '../../components/TrackList/FilteredTracks'
import FilterPopup from '../../components/FilterPopup'

const AppHome: NextPage = () => {
    const query = trpc.useInfiniteQuery(['me.tracks', {}], {
        retry: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
    const filterMutation = trpc.useMutation(['me.bpm_search'])
    const [showFilterdTracks, setShowFilterdTracks] = useState(false)
    const [showFilter, setShowFilter] = useState(false)

    const filterSubmit = (value: number[]) => {
        setShowFilterdTracks(true)
        filterMutation.mutate({
            bpmStart: value[0],
            bpmEnd: value[1],
        })
    }
    const clearFilter = () => {
        setShowFilterdTracks(false)
    }

    return (
        <Container maxWidth="sm">
            <AudioPlayer />
            <Box margin="64px 0" paddingBottom="64px">
                <Typography variant="h1">Your Tracks</Typography>
                <Box
                    display="flex"
                    marginTop="24px"
                    justifyContent="space-between"
                >
                    <LoadingButton
                        startIcon={<CachedIcon />}
                        variant="contained"
                        loading={query.isLoading}
                        loadingPosition="start"
                        onClick={() => query.refetch()}
                    >
                        Refresh
                    </LoadingButton>
                    <IconButton onClick={() => setShowFilter(!showFilter)}>
                        <FilterListIcon />
                    </IconButton>
                </Box>
                {showFilter && (
                    <OFilterPopup
                        isLoading={filterMutation.isLoading}
                        onClear={clearFilter}
                        onSubmit={filterSubmit}
                    />
                )}
                {showFilterdTracks ? (
                    <OFilterdTracks tracks={filterMutation.data ?? []} />
                ) : (
                    <OTrackList />
                )}
                {query.hasNextPage && !showFilterdTracks && (
                    <Box
                        marginTop="24px"
                        display="flex"
                        justifyContent="center"
                    >
                        <FetchMoreButton
                            variant="text"
                            loading={query.isFetchingNextPage}
                            startIcon={<ExpandMore />}
                            onClick={() => query.fetchNextPage()}
                        >
                            More
                        </FetchMoreButton>
                    </Box>
                )}
            </Box>
        </Container>
    )
}

const OTrackList = styled(TrackList)`
    margin-top: 64px;
`

const OFilterPopup = styled(FilterPopup)`
    margin-top: 24px;
`

const OFilterdTracks = styled(FilteredTracks)`
    margin-top: 64px;
`

const FetchMoreButton = styled(LoadingButton)`
    width: 100%;
`

export default AppHome
