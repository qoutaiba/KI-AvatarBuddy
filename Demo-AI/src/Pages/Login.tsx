import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Card, Divider, CardContent, Typography, Button, TextField, Alert, Fade } from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'

import './Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => void
  completedOnBoarding: boolean
}

export const Login: React.FC<LoginProps> = ({ onLogin, completedOnBoarding }) => {

  //TODO: Server Register
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [alertOpen, setAlertOpen] = useState<boolean>(false)

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== '' && password.trim() !== '') {
      onLogin(username.trim(), password.trim())
      if (completedOnBoarding) {
        navigate("/", { replace: true })
      } else {
        navigate("/onboarding")
      }
    } else {
      setAlertOpen(true)
    }
  }

  return (
    <div className="login-container">
      <Card sx={{minWidth: 320, maxWidth: 600, width: "90%", borderRadius: 4}}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h3" component="h1">AI Buddy</Typography>
            <Typography variant="subtitle1">Dein interaktiver Lernbegleiter</Typography>
            <Divider aria-hidden="true" orientation="horizontal" />
            <Typography variant="h5" component="h2">Login</Typography>

            {alertOpen && (
              <Fade in={alertOpen}>
                <Alert severity="error">Dein Benutzername oder dein Passwort ist falsch!</Alert>
              </Fade>
            )}
            <TextField label="Benutzername" variant="outlined" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} error={alertOpen} onKeyDown={(e) => {if (e.key === "Enter" && !(username.trim() === "" || password.trim() === "")) handleSubmit(e)}} />
            <TextField label="Passwort" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} error={alertOpen} type="password" onKeyDown={(e) => {if (e.key === "Enter" && !(username.trim() === "" || password.trim() === "")) handleSubmit(e)}} />
            <Button variant="contained" fullWidth onClick={handleSubmit} endIcon={<LoginIcon />} disabled={username.trim() === "" || password.trim() === ""}>
              <Typography variant="button">Anmelden</Typography>
            </Button>

            <Divider aria-hidden="true" orientation="horizontal" textAlign="center">
              <Typography variant="caption">Demo-Version: kein echter Login!</Typography>
            </Divider>
          </Stack>
        </CardContent>
      </Card>
    </div>
  )
}

