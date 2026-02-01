import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Card, CardContent, Typography, Button } from '@mui/material'

interface IClassCardProps {
  id: number; 
  name: string;
  subject: string;
}

const ClassCard: React.FC<IClassCardProps> = ({ id, name, subject }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/schoolclass/${name}/${id}/${encodeURIComponent(subject.toLowerCase())}`);
  }

  return (
    <Card sx={{borderRadius: 4}}>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h4" component="h2">
            {name} ({subject})
          </Typography>
          <Button variant="contained" fullWidth onClick={handleClick}>
            Anzeigen
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
export default ClassCard