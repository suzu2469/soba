import { createRef, memo, useCallback, useEffect, useState } from 'react'
import styled from '@emotion/styled'

import Box from '@mui/material/Box'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeDown from '@mui/icons-material/VolumeDown'
import Slider from '@mui/material/Slider'
import Image from '../Image'

type Props = {}
const AudioPlayer = memo<Props>(() => {
    const audioRef = createRef<HTMLAudioElement>()
    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(20)

    const volumeChange = useCallback(
        (e: Event, value: number | number[]) => {
            setVolume(value as number)
        },
        [setVolume],
    )

    useEffect(() => {
        if (!audioRef.current) return
        audioRef.current.volume = volume / 100
    }, [volume])

    useEffect(() => {
        if (!audioRef.current) return
        if (playing) {
            audioRef.current.play()
            return
        }
        audioRef.current.pause()
    }, [playing])

    useEffect(() => {
        if (!audioRef.current) return
        const listner = (_: Event) => {
            setPlaying(false)
        }
        audioRef.current.addEventListener('ended', listner)
        return () => {
            audioRef.current?.removeEventListener('ended', listner)
        }
    })

    return (
        <Wrap>
            <audio
                ref={audioRef}
                src="https://p.scdn.co/mp3-preview/7855814dd92574eef28a528f529c2bae0c479093?cid=ca6476386dff422191db31cc62d900cf"
            />
            <Box display="flex" alignItems="center">
                <ImageWrap>
                    <Image
                        src="https://i.scdn.co/image/ab67616d0000b2734af5f52f84d67d32efdff7ab"
                        height="100%"
                    />
                </ImageWrap>
                <PlayIconWrap onClick={() => setPlaying(!playing)}>
                    {playing ? <OPauseIcon /> : <OPlayArrowIcon />}
                </PlayIconWrap>
                <TrackDetailWrap>
                    <TrackTitle>
                        <a>Every Time (feat. So Below)</a>
                    </TrackTitle>
                    <ArtistName>Seven Lions & So Below</ArtistName>
                </TrackDetailWrap>
            </Box>
            <VolumeWrap>
                <VolumeDown />
                <VolumeSlider value={volume} onChange={volumeChange} />
            </VolumeWrap>
        </Wrap>
    )
})

export default AudioPlayer

const Wrap = styled(Box)`
    display: flex;
    justify-content: space-between;
    position: fixed;
    width: 552px;
    height: 64px;
    z-index: 10;
    transform: translateX(-50%);
    left: 50%;
    bottom: 0;
    background-color: #000;
    color: white;
`

const OPlayArrowIcon = styled(PlayArrowIcon)`
    display: block;
    cursor: pointer;
    width: 36px;
    height: 36px;
`

const OPauseIcon = styled(PauseIcon)`
    display: block;
    cursor: pointer;
    width: 36px;
    height: 36px;
`

const PlayIconWrap = styled(Box)`
    margin-left: 16px;
`

const ImageWrap = styled.div`
    height: 64px;
    width: 64px;
`

const TrackDetailWrap = styled.div`
    margin-left: 16px;
`

const TrackTitle = styled.p`
    font-weight: bold;
    font-size: 12px;

    & > a:hover {
        text-decoration: underline;
    }
`

const ArtistName = styled.p`
    margin-top: 8px;
    font-size: 12px;
`

const VolumeWrap = styled.div`
    display: flex;
    align-items: center;
    width: 128px;
    padding-right: 16px;
`

const VolumeSlider = styled(Slider)`
    margin-left: 12px;
    & .MuiSlider-track {
        background-color: white;
        border-color: white;
    }
    & .MuiSlider-rail {
        background-color: #cacaca;
        border-color: #cacaca;
    }
    & .MuiSlider-thumb {
        height: 16px;
        width: 16px;
        background-color: white;
        border-color: white;

        &:hover,
        &:focus,
        &.Mui-active {
            box-shadow: none;
        }
    }
`