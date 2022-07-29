import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import { withTRPC } from '@trpc/next'
import { RecoilRoot } from 'recoil'
import { AppRouter } from './api/trpc/[trpc]'

import '../styles/reset.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { theme } from '../styles/theme'

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@1,700&family=Noto+Sans+JP:wght@400;700&display=swap"
                    rel="stylesheet"
                ></link>
            </Head>
            <ThemeProvider theme={theme}>
                <RecoilRoot>
                    <Component {...pageProps} />
                </RecoilRoot>
            </ThemeProvider>
        </>
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
