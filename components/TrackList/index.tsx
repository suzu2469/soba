import Track from './Track'

import styled from '@emotion/styled'

type Props = {
    className?: string
}
const TrackList: React.FC<Props> = (props) => {
    return (
        <div className={props.className}>
            <TrackItem />
            <TrackItem />
            <TrackItem />
            <TrackItem />
            <TrackItem />
        </div>
    )
}

const TrackItem = styled(Track)`
    & + & {
        margin-top: 24px;
    }
`

export default TrackList
