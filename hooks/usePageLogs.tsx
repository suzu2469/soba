import * as React from 'react'
import { useRouter } from 'next/router'
import type { Logger } from 'pino'

export const usePageLogs = (logger: Logger) => {
    const router = useRouter()

    React.useEffect(() => {
        logger.info({
            type: 'access_log',
            location: router.pathname,
            query: router.query,
        })
    }, [router.pathname])
}
