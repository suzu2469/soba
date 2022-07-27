import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import Container from '@mui/material/Container'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'

import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
    const router = useRouter()
    const loginUrlMutation = trpc.useMutation(['auth.login_url'])

    if (loginUrlMutation.isSuccess && loginUrlMutation.data) {
        router.push(loginUrlMutation.data.redirectUrl)
    }

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <LoadingButton
                    onClick={() => loginUrlMutation.mutate()}
                    loading={loginUrlMutation.isLoading}
                    variant="contained"
                >
                    ログイン
                </LoadingButton>
            </Box>
        </Container>
    )
}

export default Home
