import { useState } from 'react'

import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import LoadingButton from '@mui/lab/LoadingButton'
import Typography from '@mui/material/Typography'

const marks = [
    {
        value: 50,
        label: '50',
    },
    {
        value: 100,
        label: '100',
    },
    {
        value: 150,
        label: '150',
    },
    {
        value: 200,
        label: '200',
    },
]

type Props = {
    className?: string
    onSubmit: (range: number[]) => void
    onClear: () => void
    isLoading: boolean
}
const FilterPopup: React.FC<Props> = (props) => {
    const [value, setValue] = useState<number[]>([100, 120])
    const handleChange = (e: Event, newValue: number | number[]) => {
        setValue(newValue as number[])
    }
    const handleSubmit = () => {
        props.onSubmit(value)
    }

    return (
        <Box className={props.className}>
            <Typography gutterBottom>BPM</Typography>
            <Slider
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={10}
                max={250}
                marks={marks}
            />
            <Box display="flex" marginTop="24px" justifyContent="flex-end">
                <LoadingButton variant="outlined" onClick={props.onClear}>
                    Reset
                </LoadingButton>
                <LoadingButton
                    sx={{ marginLeft: '12px' }}
                    variant="contained"
                    loading={props.isLoading}
                    onClick={handleSubmit}
                >
                    Submit Filter
                </LoadingButton>
            </Box>
        </Box>
    )
}

export default FilterPopup
