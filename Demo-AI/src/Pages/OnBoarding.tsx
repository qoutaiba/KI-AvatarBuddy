import React, { useState } from 'react';
import { Grid, Stack, Card, Divider, CardContent, Typography, Button, TextField, Alert, Fade } from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import './OnBoarding.css';
//Character Component
import Character from '../avatar/components/Character/Character';
import { useNavigate } from 'react-router-dom';

interface OnBoardingProps {
  name: string;
  onComplete: (interests: string[]) => void;
}


export const OnBoarding: React.FC<OnBoardingProps> = ({ onComplete, name }) => {
  const [interestsInput, setInterestsInput] = useState<string>('');
  const [alertOpen, setAlertOpen] = useState<boolean>(false)
  const navigate = useNavigate();

  const interests = interestsInput
    .split(',')
    .map(interest => interest.trim()).filter(interest => interest !== '');
  

  const handleSubmit = () => {
  
    if (interests.length === 0) {
        setAlertOpen(true);
        return;
    }

    onComplete(interests);
    navigate("/", { replace: true })
}

  return (
    <div className="onboarding-container">
      <Grid container spacing={4} justifyContent={'center'} alignItems={'center'} sx={{margin: '32px' }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 2, md: 1 } }}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h3" component="h1">Willkommen, {name}!</Typography>
                <Typography variant="subtitle1">Bevor wir weitermachen, nenne mir bitte deine Interessen.</Typography>
                <Divider aria-hidden="true" orientation="horizontal" />
                <Typography variant="h5" component="h2">Interessen</Typography>

                {alertOpen && (
                  <Fade in={alertOpen}>
                    <Alert severity="error">Bitte gib mindestens ein Interesse an!</Alert>
                  </Fade>
                )}
                <TextField label="Was interessiert dich?" placeholder='z.B. Mathe, Fußball oder Geschichte' variant="outlined" fullWidth margin="normal" value={interestsInput} onChange={(e) => setInterestsInput(e.target.value)} error={alertOpen}/>
                <Button variant="contained" fullWidth onClick={handleSubmit} endIcon={<MeetingRoomIcon />} disabled={interests.length === 0}>
                  <Typography variant="button">Zur Fächerauswahl</Typography>
                </Button>

                <Divider aria-hidden="true" orientation="horizontal" textAlign="center">
                  <Typography variant="caption">Demo-Version: Interessen werden nicht gespeichert!</Typography>
                </Divider>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: { xs: 1, md: 2 } }}>
          <Character /> 
        </Grid>
      </Grid>
    </div>
  )
}

