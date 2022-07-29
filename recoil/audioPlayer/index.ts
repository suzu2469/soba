import { atom } from 'recoil'

type AudioPlayerState = {
    audioUrl: string
    imageUrl: string
    artist: string
    title: string
    spotifyUri: string
}
export const audioPlayerState = atom<AudioPlayerState | null>({
    key: 'AudioPlayer',
    default: null,
})
