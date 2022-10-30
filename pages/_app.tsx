import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import { withTRPC } from '@trpc/next'
import { RecoilRoot } from 'recoil'
import { AppRouter } from './api/trpc/[trpc]'
import logger from '../utils/logger'
import { usePageLogs } from '../hooks/usePageLogs'

import '../styles/reset.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { theme } from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
    usePageLogs(logger)

    return (
        <ThemeProvider theme={theme}>
            <RecoilRoot>
                <Component {...pageProps} />
            </RecoilRoot>
        </ThemeProvider>
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
