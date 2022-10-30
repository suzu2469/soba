import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import cryptoRandomString from 'crypto-random-string'
import { createClient } from '@redis/client'
import queryString from 'query-string'
import * as crypto from 'crypto'
import axios, { AxiosResponse } from 'axios'
import { z } from 'zod'
import logger from '../../../utils/logger'

import addSeconds from 'date-fns/addSeconds'
import formatRFC7231 from 'date-fns/formatRFC7231'
import range from 'lodash/range'

const host = () =>
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://soba.suzurin.me'

const createContext = async ({
    req,
    res,
}: trpcNext.CreateNextContextOptions) => {
    const redis = createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    })
    redis.on('error', (err) => logger.error(err))

    return {
        accessToken: null,
        redis,
        req,
        res,
    }
}
type Context = trpc.inferAsyncReturnType<typeof createContext>

const createSpotifyAuthToken = (clientId: string, clientSecret: string) =>
    Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

const accessTokenCookieKey = 'access_token'
const accessTokenCookie = (token: string, expires: number) =>
    `${accessTokenCookieKey}=${token}; Path=/; SameSite=Strict; Expires=${formatRFC7231(
        addSeconds(new Date(), expires),
    )}; HttpOnly`

const refreshTokenCookieKey = 'refresh_token'
const refreshTokenCookie = (token: string) =>
    `${refreshTokenCookieKey}=${token}; Path=/; SameSite=Strict; HttpOnly`

const getUsersSavedTracks = async (
    accessToken: string,
    cursor: number,
    limit: number,
) => {
    type SpotifyGetUsersSavedTracksResponse = {
        items: any[]
        limit: number
        offset: number
        next: string
        previous: string
        total: number
    }
    type SpotifyGetUsersSavedTracksRequest = {
        limit: number
        offset: number
    }
    let res: AxiosResponse<SpotifyGetUsersSavedTracksResponse>

    try {
        res = await axios.get(`https://api.spotify.com/v1/me/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                limit: limit,
                offset: cursor - 1,
            } as SpotifyGetUsersSavedTracksRequest,
        })
    } catch (e) {
        logger.error({ e })
        throw new trpc.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Spotify request failed',
            cause: e,
        })
    }

    const trackIDs = res.data.items.map((item) => item?.track?.id)
    let bpms: Record<string, number>
    try {
        const audioFeatures = await axios.get(
            `https://api.spotify.com/v1/audio-features`,
            {
                params: { ids: trackIDs.join(',') },
                headers: { Authorization: `Bearer ${accessToken}` },
            },
        )
        bpms =
            audioFeatures.data?.audio_features?.reduce(
                (p: any, c: Record<string, number>) => ({
                    ...p,
                    [c?.id ?? '']: c?.tempo ?? 0,
                }),
                {},
            ) ?? {}
    } catch (e) {
        logger.error({ error: e })
        throw new trpc.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Spotify request failed',
            cause: e,
        })
    }

    return {
        total: res.data.total,
        items: res.data.items.map((item) => {
            return {
                id: item?.track?.id ?? '',
                title: item?.track?.name ?? '',
                url: item?.track?.uri ?? '',
                preview: item?.track?.preview_url ?? '',
                image: item?.track?.album?.images[0]?.url ?? '',
                artist:
                    item?.track?.artists
                        ?.map((a: any) => a?.name ?? '')
                        .join(' & ') ?? '',
                bpm: bpms[item?.track?.id ?? ''] ?? 0,
            }
        }),
    }
}

const protectedRouter = trpc
    .router<Context>()
    .middleware(async ({ ctx, next }) => {
        const accessToken = ctx.req.cookies[accessTokenCookieKey]
        if (!accessToken) {
            const refreshToken = ctx.req.cookies[refreshTokenCookieKey]
            if (!refreshToken) {
                logger.error(new Error('Unauthorized'))
                throw new trpc.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'AccessToken is not found',
                })
            }

            type SpotifyRefreshTokenResponse = {
                access_token: string
                token_type: string
                scope: string
                expires_in: number
            }
            let res: AxiosResponse<SpotifyRefreshTokenResponse>
            try {
                const params = new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
                })
                res = await axios.post<SpotifyRefreshTokenResponse>(
                    `https://accounts.spotify.com/api/token`,
                    params,
                    {
                        headers: {
                            Authorization: `Basic ${createSpotifyAuthToken(
                                process.env.SPOTIFY_CLIENT_ID ?? '',
                                process.env.SPOTIFY_CLIENT_SECRET ?? '',
                            )}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                )
            } catch (e) {
                logger.error({ error: e })
                ctx.res.setHeader(
                    'Set-Cookie',
                    `${refreshTokenCookieKey}=deleted; Path=/; Expires=${new Date().toUTCString()}`,
                )
                throw new trpc.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Token refresh failed',
                })
            }

            ctx.res.setHeader(
                'Set-Cookie',
                accessTokenCookie(res.data.access_token, res.data.expires_in),
            )

            return next({ ctx: { ...ctx, accessToken: res.data.access_token } })
        }

        return next({ ctx: { ...ctx, accessToken } })
    })
    .query('tracks', {
        input: z.object({
            cursor: z.number().nullish(),
        }),
        resolve: async ({ ctx, input }) => {
            const cursor: number = input.cursor ?? 1
            const limit = 50

            const res = await getUsersSavedTracks(
                ctx.accessToken,
                cursor,
                limit,
            )

            return {
                items: res.items,
                nextCursor: res.total > limit ? cursor + limit : null,
            }
        },
    })
    .mutation('bpm_search', {
        input: z.object({
            bpmStart: z.number().min(1).max(999),
            bpmEnd: z.number().min(1).max(999),
        }),
        resolve: async ({ ctx, input }) => {
            const limit = 50

            const firstRes = await getUsersSavedTracks(
                ctx.accessToken,
                1,
                limit,
            )
            const requestsCount = Math.ceil(firstRes.total / limit)
            const requests = await Promise.all(
                range(1, requestsCount).map((requestCount) =>
                    getUsersSavedTracks(
                        ctx.accessToken,
                        (requestCount - 1) * limit + 1,
                        limit,
                    ),
                ),
            )

            const result = requests
                .flatMap((res) => res.items)
                .filter(
                    (item) =>
                        input.bpmStart <= item.bpm && item.bpm <= input.bpmEnd,
                )

            logger.info({
                type: 'access_log',
                data: {
                    bpmStart: input.bpmStart,
                    bpmEnd: input.bpmEnd,
                    result,
                },
            })

            return result
        },
    })

type SessionData = {
    state: string
    verifier: string
}

export const appRouter = trpc
    .router<Context>()
    .mutation('auth.login_url', {
        resolve: async ({ ctx }) => {
            const sessionId = crypto.randomUUID()
            const verifier = cryptoRandomString({
                length: 64,
                type: 'alphanumeric',
            })
            const state = cryptoRandomString({ length: 16, type: 'url-safe' })
            const codeChallenge = crypto
                .createHash('SHA256')
                .update(verifier, 'utf8')
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '')

            await ctx.redis.connect()
            await ctx.redis.set(
                sessionId,
                JSON.stringify({ state, verifier } as SessionData),
                {
                    EX: 300,
                },
            )
            ctx.redis.disconnect()

            ctx.res.setHeader(
                'Set-Cookie',
                `sid=${sessionId}; SameSite=Strict; Path=/; HttpOnly`,
            )

            return {
                redirectUrl: `https://accounts.spotify.com/authorize?${queryString.stringify(
                    {
                        response_type: 'code',
                        client_id: process.env.SPOTIFY_CLIENT_ID,
                        scope: 'user-library-read',
                        redirect_uri: `${host()}/auth/callback`,
                        state,
                        code_challenge: codeChallenge,
                        code_challenge_method: 'S256',
                    },
                )}`,
            }
        },
    })
    .query('auth.callback', {
        input: z.object({
            code: z.string(),
            state: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const sessionId = ctx.req.cookies['sid']
            if (!sessionId) {
                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'SessionId is not found',
                })
            }

            await ctx.redis.connect()
            await ctx.redis.select(0)
            const sessionDataStr = await ctx.redis.get(sessionId)
            ctx.redis.disconnect()

            if (!sessionDataStr) {
                throw new trpc.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Session is invalid',
                })
            }

            const sessionData = JSON.parse(sessionDataStr) as SessionData

            if (sessionData.state !== input.state) {
                throw new trpc.TRPCError({
                    code: 'BAD_REQUEST',
                    message: `state is not match: cookie = ${sessionData.state}, input = ${input.state}`,
                })
            }

            const formData = new URLSearchParams({
                code: input.code,
                redirect_uri: `${host()}/auth/callback`,
                grant_type: 'authorization_code',
                client_id: process.env.SPOTIFY_CLIENT_ID ?? '',
                code_verifier: sessionData.verifier,
            })
            type SpotifyTokenResponse = {
                access_token: string
                token_type: string
                scope: string
                expires_in: number
                refresh_token: string
            }
            let res: AxiosResponse<SpotifyTokenResponse>
            try {
                res = await axios.post(
                    'https://accounts.spotify.com/api/token',
                    formData,
                    {
                        headers: {
                            Authorization: `Basic ${createSpotifyAuthToken(
                                process.env.SPOTIFY_CLIENT_ID ?? '',
                                process.env.SPOTIFY_CLIENT_SECRET ?? '',
                            )}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                )
            } catch (e) {
                logger.error({ error: e })
                throw new trpc.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Request faield to Spotify',
                    cause: e,
                })
            } finally {
                await ctx.redis.connect()
                await ctx.redis.del(sessionId)
                ctx.redis.disconnect()
            }

            ctx.res.setHeader('Set-Cookie', [
                accessTokenCookie(res.data.access_token, res.data.expires_in),
                refreshTokenCookie(res.data.refresh_token),
            ])

            return
        },
    })
    .merge('me.', protectedRouter)

export type AppRouter = typeof appRouter

export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
})
