import type { AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material/styles'
import { withTRPC } from '@trpc/next'
import { RecoilRoot } from 'recoil'
import { AppRouter } from './api/trpc/[trpc]'
import { theme } from '../styles/theme'
import ErrorBoundary from '../components/ErrorBoundary'
import logger from '../utils/logger'

import '../styles/reset.css'
import '../styles/globals.css'

const MyApp = ({ Component, pageProps }: AppProps) => {
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <RecoilRoot>
                    <Component {...pageProps} />
                </RecoilRoot>
            </ThemeProvider>
        </ErrorBoundary>
    )
}

export default withTRPC<AppRouter>({
    config({ ctx }) {
        return {
            url: '/api/trpc',
        }
    },
    ssr: false,
})(MyApp)
