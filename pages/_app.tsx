import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import { withTRPC } from '@trpc/next'
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
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    )
}

export default withTRPC<AppRouter>({
    config({ ctx }) {
        const url = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}/api/trpc`
            : 'http://localhost:3000/api/trpc'

        return {
            url,
        }
    },
    ssr: false,
})(MyApp)
