import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Track from './Track'

type Props = {
    tracks: any[]
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
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
                    onClickImage={() => {}}
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
