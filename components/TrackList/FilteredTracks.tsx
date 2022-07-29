import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Track from './Track'
import { useSetRecoilState } from 'recoil'
import { audioPlayerState } from '../../recoil/audioPlayer'
import { useCallback } from 'react'

type Props = {
    tracks: any[]
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    const setAudioPlayer = useSetRecoilState(audioPlayerState)

    const clickImage = useCallback(
        (id: string) => {
            const item = props.tracks.find((item) => id === item.id)
            if (!item) return
            setAudioPlayer({
                title: item.title,
                artist: item.artist,
                imageUrl: item.image,
                audioUrl: item.preview,
                spotifyUri: item.url,
            })
        },
        [props.tracks],
    )

    return (
        <div className={props.className}>
            {props.tracks.map((item) => (
                <TrackItem
                    key={item.id}
                    id={item.id}
                    url={item.url}
                    title={item.title}
                    image={item.image}
                    artist={item.artist}
                    bpm={item.bpm}
                    onClickImage={clickImage}
                />
            ))}
        </div>
    )
}

const TrackItem = styled(Track)`
    & + & {
        margin-top: 24px;
    }
`

export default TrackList
