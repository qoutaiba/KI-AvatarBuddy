import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Card, CardContent, Typography, Button } from '@mui/material'
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

interface IClassCardProps {
  name: string
}

const ClassCard: React.FC<IClassCardProps>  = ({ name }) => {

  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/schoolclass/${encodeURIComponent(name.toLowerCase())}`)
  }

  return (
        <Card sx={{borderRadius: 4}}>
            <CardContent>
                <Stack spacing={3}>
                <Typography variant="h4" component="h2" sx={{overflow: "hidden", textOverflow: "ellipsis"}}>{name}</Typography>
                <Button variant="contained" fullWidth endIcon={<SupervisorAccountIcon />} onClick={handleClick}>
                    <Typography variant="button">Anzeigen</Typography>
                </Button>
                </Stack>
            </CardContent>
        </Card>
  );
};

export default ClassCard;