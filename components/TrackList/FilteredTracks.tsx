import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Track from './Track'

type Track = {
    id: string
    title: string
    image: string
    artist: string
    bpm: number
}
type Props = {
    tracks: Track[]
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    return (
        <div className={props.className}>
            {props.tracks.map((item) => (
                <TrackItem
                    key={item.id}
                    title={item.title}
                    image={item.image}
                    artist={item.artist}
                    bpm={item.bpm}
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
