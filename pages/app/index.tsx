import { NextPage } from 'next'
import { useState } from 'react'
import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import CachedIcon from '@mui/icons-material/Cached'
import TrackList from '../../components/TrackList'

const AppHome: NextPage = () => {
    const utils = trpc.useContext()
    const [loading, setLoading] = useState(false)

    const clickRefetchButton = () => {
        setLoading(true)
        utils.invalidateQueries(['me.tracks']).then(() => setLoading(false))
    }

    return (
        <Container maxWidth="sm">
            <Box marginTop="64px">
                <Typography variant="h1">Your Tracks</Typography>
                <Box marginTop="24px">
                    <LoadingButton
                        startIcon={<CachedIcon />}
                        variant="contained"
                        loading={loading}
                        loadingPosition="start"
                        onClick={clickRefetchButton}
                    >
                        Refresh
                    </LoadingButton>
                </Box>
                <OTrackList />
            </Box>
        </Container>
    )
}

const OTrackList = styled(TrackList)`
    margin-top: 40px;
`

export default AppHome
