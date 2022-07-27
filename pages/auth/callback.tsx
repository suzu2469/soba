import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { trpc } from '../../utils/trpc'

type Props = {
    code: string
    state: string
}
const Callback: NextPage<Props> = (props) => {
    const router = useRouter()

    const query = trpc.useQuery([
        'auth.callback',
        {
            code: props.code,
            state: props.state,
        },
    ])

    if (query.isError) {
        router.push('/auth/fail')
    }

    if (query.isSuccess) {
        router.push('/app')
    }

    return <></>
}

Callback.getInitialProps = async ({ query, res }) => {
    const stringOrHead = (
        x: string | string[] | undefined,
    ): string | undefined =>
        x ? (typeof x === 'string' ? x : x[0]) : undefined

    const code = stringOrHead(query['code'])
    const state = stringOrHead(query['state'])
    const error = stringOrHead(query['error'])

    if (error || !state || !code) {
        res?.writeHead(302, { location: '/auth/fail' })
        res?.end()
        return {
            state: '',
            code: '',
        }
    }

    return {
        state,
        code,
    }
}

export default Callback
