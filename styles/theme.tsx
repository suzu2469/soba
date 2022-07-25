import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
    palette: {
        primary: {
            main: '#000',
        },
        secondary: {
            main: '#fff',
        },
    },
    typography: {
        fontFamily: 'Noto Sans JP',
        h1: {
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: 57,
            fontWeight: 'bold',
            fontStyle: 'italic',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '0',
                    boxShadow: 'none',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '14px',
                    ':hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
    },
})
