import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import cryptoRandomString from 'crypto-random-string'
import { createClient } from '@redis/client'
import queryString from 'query-string'
import * as crypto from 'crypto'
import axios, { AxiosResponse } from 'axios'
import { z } from 'zod'

import range from 'lodash/range'

const createContext = async ({
    req,
    res,
}: trpcNext.CreateNextContextOptions) => {
    const redis = createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    })

    redis.on('error', (err) => console.error(err))
    await redis.connect()

    return {
        redis,
        req,
        res,
    }
}
type Context = trpc.inferAsyncReturnType<typeof createContext>

const createSpotifyAuthToken = (clientId: string, clientSecret: string) =>
    Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

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
                (p, c) => ({ ...p, [c?.id ?? '']: c?.tempo ?? 0 }),
                {},
            ) ?? {}
    } catch (e) {
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
                image: item?.track?.album?.images[0]?.url ?? '',
                artist:
                    item?.track?.artists
                        ?.map((a) => a?.name ?? '')
                        .join(' & ') ?? '',
                bpm: bpms[item?.track?.id ?? ''] ?? 0,
            }
        }),
    }
}

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

            await ctx.redis.set(
                sessionId,
                JSON.stringify({ state, verifier } as SessionData),
                {
                    EX: 300,
                },
            )

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
                        redirect_uri: 'http://localhost:3000/auth/callback',
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

            await ctx.redis.select(0)
            const sessionDataStr = await ctx.redis.get(sessionId)

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
                redirect_uri: 'http://localhost:3000/auth/callback',
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
                throw new trpc.TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Request faield to Spotify',
                    cause: e,
                })
            } finally {
                await ctx.redis.del(sessionId)
            }

            ctx.res.setHeader('Set-Cookie', [
                `access_token=${res.data.access_token}; Path=/; SameSite=Strict; HttpOnly`,
                `refresh_token=${res.data.refresh_token}; Path=/; SameSite=Strict; HttpOnly`,
            ])

            return
        },
    })
    .query('me.tracks', {
        input: z.object({
            cursor: z.number().nullish(),
        }),
        resolve: async ({ ctx, input }) => {
            const cursor: number = input.cursor ?? 1
            const limit = 50
            const accessToken = ctx.req.cookies['access_token']
            if (!accessToken) {
                throw new trpc.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'AccessToken is not found',
                })
            }

            const res = await getUsersSavedTracks(accessToken, cursor, limit)

            return {
                items: res.items,
                nextCursor: res.total > limit ? cursor + limit : null,
            }
        },
    })
    .mutation('me.bpm_search', {
        input: z.object({
            bpmStart: z.number().min(1).max(999),
            bpmEnd: z.number().min(1).max(999),
            cursor: z.number().min(1).nullish(),
        }),
        resolve: async ({ ctx, input }) => {
            const limit = 50
            const cursor: number = input.cursor ?? 1
            const accessToken = ctx.req.cookies['access_token']
            if (!accessToken) {
                throw new trpc.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'AccessToken is not found',
                })
            }

            const firstRes = await getUsersSavedTracks(
                accessToken,
                cursor,
                limit,
            )
            const requestsCount = Math.ceil(firstRes.total / limit)
            const requests = await Promise.all(
                range(1, requestsCount).map((requestCount) =>
                    getUsersSavedTracks(
                        accessToken,
                        (requestCount - 1) * limit,
                        limit,
                    ),
                ),
            )

            return requests
                .flatMap((res) => res.items)
                .filter(
                    (item) =>
                        input.bpmStart <= item.bpm && item.bpm <= input.bpmEnd,
                )
        },
    })

export type AppRouter = typeof appRouter

export default trpcNext.createNextApiHandler({
    router: appRouter,
    createContext,
})
