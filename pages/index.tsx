import type { NextPage } from 'next'
import { useRouter } from 'next/router'

import Container from '@mui/material/Container'
import LoadingButton from '@mui/lab/LoadingButton'

import { trpc } from '../utils/trpc'

const Home: NextPage = () => {
    const router = useRouter()
    const loginUrlMutation = trpc.useMutation(['auth.login_url'])

    if (loginUrlMutation.isSuccess && loginUrlMutation.data) {
        router.push(loginUrlMutation.data.redirectUrl)
    }

    return (
        <Container maxWidth="sm">
            <LoadingButton
                onClick={() => loginUrlMutation.mutate()}
                loading={loginUrlMutation.isLoading}
                variant="contained"
            >
                ログイン
            </LoadingButton>
        </Container>
    )
}

export default Home
