import { createRef, memo, useCallback, useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'
import throttle from 'lodash/throttle'
import styled from '@emotion/styled'
import { audioPlayerState } from '../../recoil/audioPlayer'

import Box from '@mui/material/Box'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeUp from '@mui/icons-material/VolumeUp'
import VolumeMute from '@mui/icons-material/VolumeMute'
import Slider from '@mui/material/Slider'
import Image from '../Image'

type Props = {}
const AudioPlayer = memo<Props>(() => {
    const audioRef = createRef<HTMLAudioElement>()
    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(10)
    const [seek, setSeek] = useState(0)
    const audioPlayer = useRecoilValue(audioPlayerState)

    const volumeChange = useCallback(
        (e: Event, value: number | number[]) => {
            setVolume(value as number)
        },
        [setVolume],
    )

    const timeUpdate = useCallback(
        throttle(() => {
            setSeek(
                Math.round(
                    !audioRef.current
                        ? 0
                        : (audioRef.current?.currentTime /
                              audioRef.current?.duration) *
                              100,
                ) / 100,
            )
        }, 100),
        [audioRef],
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
        const endListner = (_: Event) => {
            setPlaying(false)
        }
        const playListner = (_: Event) => {
            setPlaying(true)
        }
        audioRef.current.addEventListener('ended', endListner)
        audioRef.current.addEventListener('play', playListner)
        return () => {
            audioRef.current?.removeEventListener('ended', endListner)
            audioRef.current?.removeEventListener('play', playListner)
        }
    }, [])

    return (
        <Wrap>
            <audio
                ref={audioRef}
                src={audioPlayer?.audioUrl ?? ''}
                autoPlay
                onTimeUpdate={timeUpdate}
            />
            <Box height="64px">
                <Box display="flex" alignItems="center">
                    <ImageWrap>
                        {audioPlayer && (
                            <Image
                                src={audioPlayer?.imageUrl ?? ''}
                                height="100%"
                            />
                        )}
                    </ImageWrap>
                    <PlayIconWrap onClick={() => setPlaying(!playing)}>
                        {playing ? <OPauseIcon /> : <OPlayArrowIcon />}
                    </PlayIconWrap>
                    <TrackDetailWrap>
                        <TrackTitle>
                            <a href={audioPlayer?.spotifyUri ?? ''}>
                                {audioPlayer?.title ?? ''}
                            </a>
                        </TrackTitle>
                        <ArtistName>{audioPlayer?.artist}</ArtistName>
                    </TrackDetailWrap>
                </Box>
                <VolumeWrap>
                    {volume === 0 ? (
                        <VolumeMute />
                    ) : volume < 50 ? (
                        <VolumeDown />
                    ) : (
                        <VolumeUp />
                    )}
                    <VolumeSlider
                        value={volume}
                        valueLabelDisplay="auto"
                        onChange={volumeChange}
                    />
                </VolumeWrap>
            </Box>
            <Box height="3px">
                <SeekInner style={{ width: `${seek * 100}%` }} />
            </Box>
        </Wrap>
    )
})

export default AudioPlayer

const Wrap = styled(Box)`
    //display: flex;
    justify-content: space-between;
    position: fixed;
    width: 552px;
    height: 67px;
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
    & .MuiSlider-valueLabel {
        background-color: black;
        color: white;
    }
`

const SeekInner = styled.div`
    height: 100%;
    background-color: white;
    content: '';
`
