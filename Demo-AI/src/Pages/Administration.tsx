import React from 'react'
import { Typography, Box, Grid } from '@mui/material'

import ClassCard from '../components/ClassCard/ClassCard';
import type { SchoolClass } from '../classes/SchoolClass';

interface IAdministrationProps {
  schoolClasses: SchoolClass[] | null;
}

 export const Administration: React.FC<IAdministrationProps>  = ({ schoolClasses }) => {
  return (
    <Box sx={{width: "100vw", height: "100vh", overflowY: "auto"}}>
        <Box sx={{marginLeft: '32px', marginRight: '32px', marginTop: '32px'}}>
            <Typography variant='h3' component='h1' gutterBottom sx={{ ml: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}>Verwaltung</Typography>
            <Typography variant='subtitle1' sx={{ ml: 0.5 }}>Wählen Sie eine Klasse, um zu beginnen.</Typography>
        </Box>
        <Grid container spacing={4} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{margin: '32px'}}>
            {
                schoolClasses &&
                schoolClasses.map((schoolClass, i) =>
                    <Grid key={`${schoolClass}-${i}`} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                        <ClassCard name={schoolClass.name} />
                    </Grid>)
            }
        </Grid>
    </Box>
  );
};

