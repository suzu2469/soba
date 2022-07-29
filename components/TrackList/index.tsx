import { useCallback, useMemo } from 'react'
import { useSetRecoilState } from 'recoil'
import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'
import { audioPlayerState } from '../../recoil/audioPlayer'

import Track from './Track'

type Props = {
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    const query = trpc.useInfiniteQuery(['me.tracks', {}])
    const setAudioPlayer = useSetRecoilState(audioPlayerState)

    const items = useMemo(() => {
        return query.data?.pages.flatMap((page) => page?.items) ?? []
    }, [query.data])

    const clickImage = useCallback(
        (id: string) => {
            const item = items.find((item) => id === item.id)
            if (!item) return
            setAudioPlayer({
                title: item.title,
                artist: item.artist,
                imageUrl: item.image,
                audioUrl: item.preview,
                spotifyUri: item.url,
            })
        },
        [items],
    )

    return (
        <div className={props.className}>
            {query.data?.pages.map((page) =>
                page?.items?.map((item) => (
                    <TrackItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        image={item.image}
                        artist={item.artist}
                        bpm={item.bpm}
                        url={item.url}
                        onClickImage={clickImage}
                    />
                )),
            )}
        </div>
    )
}

const TrackItem = styled(Track)`
    & + & {
        margin-top: 24px;
    }
`

export default TrackList
