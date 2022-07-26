import styled from '@emotion/styled'
import { trpc } from '../../utils/trpc'

import Track from './Track'

type Props = {
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    const query = trpc.useQuery(['me.tracks'], { retry: false })

    return (
        <div className={props.className}>
            {query.data?.items?.map((item) => (
                <TrackItem
                    key={item?.track?.id}
                    title={item?.track?.name}
                    image={item?.track?.album?.images[0]?.url}
                    artist={item?.track?.artists
                        ?.map((artist) => artist?.name)
                        .join(' & ')}
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
