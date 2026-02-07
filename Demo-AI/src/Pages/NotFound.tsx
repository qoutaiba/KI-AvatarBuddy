import { Typography, Box } from '@mui/material'

export const NotFound = () => {
    return (
        <Box sx={{width: "100vw", height: "100vh", overflowY: "auto"}}>
            <Box sx={{marginLeft: '32px', marginRight: '32px', marginTop: '32px'}}>
                <Typography variant='h3' component='h1' gutterBottom sx={{ ml: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}>404</Typography>
                <Typography variant='subtitle1' sx={{ ml: 0.5 }}>Seite nicht gefunden!</Typography>
            </Box>
        </Box>
    )
}

