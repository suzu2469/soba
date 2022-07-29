import styled from '@emotion/styled'

import Box from '@mui/material/Box'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import Image from '../../../components/Image'
import { useState } from 'react'

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
    const [showPlayIcon, setShowPlayIcon] = useState(false)

    return (
        <Box
            className={props.className}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            height="48px"
        >
            <Box display="flex" alignItems="center">
                <ImageWrap
                    onClick={() => props.onClickImage(props.id)}
                    onMouseEnter={() => setShowPlayIcon(true)}
                    onMouseLeave={() => setShowPlayIcon(false)}
                >
                    {showPlayIcon && (
                        <ImagePlay>
                            <OPlayCircleIcon />
                        </ImagePlay>
                    )}
                    <Image width="48px" src={props.image} alt="" />
                </ImageWrap>
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

const ImageWrap = styled.div`
    position: relative;
`

const ImagePlay = styled.div`
    cursor: pointer;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #00000050;
`

const OPlayCircleIcon = styled(PlayCircleOutlineIcon)`
    color: white;
    width: 36px;
    height: 36px;
`

export default Track
