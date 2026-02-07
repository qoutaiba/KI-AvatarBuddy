import React from 'react'
import {Box, Grid, Typography} from '@mui/material'

import type {ISubjectSelectionProps} from '../Interfaces/ISubjectSelectionProps'
import SubjectCard from '../components/SubjectCard/SubjectCard'
import {useNavigate} from "react-router-dom";

export const SubjectSelection: React.FC<ISubjectSelectionProps> = ({username, subjects}) => {
    const navigate = useNavigate();
    return (
        <Box sx={{width: "100vw", height: "100vh", overflowY: "auto"}}>
            <Box sx={{marginLeft: '32px', marginRight: '32px', marginTop: '32px'}}>
                <Typography variant='h3' component='h1' gutterBottom
                            sx={{ml: 0.5, overflow: "hidden", textOverflow: "ellipsis"}}>Hallo, {username}!</Typography>
                <Typography variant='subtitle1' sx={{ml: 0.5}}>Wähle ein Fach, um zu beginnen.</Typography>
            </Box>
            <Grid container spacing={4} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{margin: '32px'}}>
                {
                    subjects &&
                    subjects.map((subject, i) =>
                        <Grid key={`${subject}-${i}`}
                              size={{xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4}}
                              onClick={() => navigate("/classroom", {state: {subject}})}
                        >
                            <SubjectCard name={subject.name} badgeNumber={subject.badgeNumber}/>
                        </Grid>)
                }
            </Grid>
        </Box>
    );
};

