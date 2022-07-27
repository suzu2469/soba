import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Track from './Track'

type Props = {
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    const query = trpc.useInfiniteQuery(['me.tracks', {}])

    return (
        <div className={props.className}>
            {query.data?.pages.map((page) =>
                page?.items?.map((item) => (
                    <TrackItem
                        key={item.id}
                        title={item.title}
                        image={item.image}
                        artist={item.artist}
                        bpm={item.bpm}
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
