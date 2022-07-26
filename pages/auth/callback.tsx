import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import { trpc } from '../../utils/trpc'

const Callback: NextPage = () => {
    const router = useRouter()
    const queryCode = router.query['code']
    const queryState = router.query['state']
    const error = router.query['error']

    const code = useMemo(() => {
        if (!queryCode) {
            return ''
        }
        if (typeof queryCode === 'string') {
            return queryCode
        }

        return queryCode[0]
    }, [queryCode])

    const state = useMemo(() => {
        if (!queryState) {
            return ''
        }
        if (typeof queryState === 'string') {
            return queryState
        }
        return queryState[0]
    }, [queryState])

    const query = trpc.useQuery([
        'auth.callback',
        {
            code,
            state,
        },
    ])

    if (error || !code || !state || query.isError) {
        router.push('/auth/fail')
    }

    if (query.isSuccess) {
        router.push('/app')
    }

    return <></>
}

export default Callback
