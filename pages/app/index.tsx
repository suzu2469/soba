import { NextPage } from 'next'
import { useState } from 'react'
import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import CachedIcon from '@mui/icons-material/Cached'
import ExpandMore from '@mui/icons-material/ExpandMore'
import TrackList from '../../components/TrackList'

const AppHome: NextPage = () => {
    const query = trpc.useInfiniteQuery(['me.tracks', {}], {
        retry: false,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

    return (
        <Container maxWidth="sm">
            <Box margin="64px 0" paddingBottom="64px">
                <Typography variant="h1">Your Tracks</Typography>
                <Box marginTop="24px">
                    <LoadingButton
                        startIcon={<CachedIcon />}
                        variant="contained"
                        loading={query.isLoading}
                        loadingPosition="start"
                        onClick={() => query.refetch()}
                    >
                        Refresh
                    </LoadingButton>
                </Box>
                <OTrackList />
                {query.hasNextPage && (
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
    margin-top: 40px;
`

const FetchMoreButton = styled(LoadingButton)`
    width: 100%;
`

export default AppHome
