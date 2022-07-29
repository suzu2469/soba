import styled from '@emotion/styled'

import Box from '@mui/material/Box'
import Image from '../../../components/Image'

type Props = {
    id: string
    image: string
    artist: string
    title: string
    bpm: number
    url: string
    onClickImage: (id: string) => void
    className?: string
}
const Track: React.FC<Props> = (props) => {
    return (
        <Box
            className={props.className}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            height="48px"
        >
            <Box display="flex" alignItems="center">
                <Box
                    onClick={() => props.onClickImage(props.id)}
                    position="relative"
                >
                    <Image width="48px" src={props.image} alt="" />
                </Box>
                <Box
                    display="flex"
                    marginLeft="24px"
                    justifyContent="center"
                    flexDirection="column"
                >
                    <TrackTitle>
                        <a href={props.url}>{props.title}</a>
                    </TrackTitle>
                    <TrackArtist>{props.artist}</TrackArtist>
                </Box>
            </Box>
            <Box>
                <Box marginLeft="24px">
                    <TrackBPM>{Math.round(props.bpm ?? 0)}</TrackBPM>
                </Box>
            </Box>
        </Box>
    )
}

const TrackTitle = styled.p`
    font-size: 18px;
    font-weight: bold;

    & > a:hover {
        text-decoration: underline;
    }
`

const TrackArtist = styled.p`
    font-size: 14px;
    margin-top: 4px;
`

const TrackBPM = styled.p`
    font-family: 'Josefin sans', sans-serif;
    font-size: 32px;
    font-weight: bold;
`

export default Track
