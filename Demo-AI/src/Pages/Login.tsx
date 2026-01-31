import React, {useState} from 'react';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Divider,
    Fade,
    IconButton,
    Link,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';


import './Login.css';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';


interface LoginProps {
    onLogin: (username: string, password: string, role: string) => void
}

export const Login: React.FC<LoginProps> = ({onLogin}) => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [alertOpen, setAlertOpen] = useState<boolean>(false)
    type Role = "NONE" | "ADMIN" | "STUDENT" | "TEACHER"

    const [role, setRole] = useState<Role>("NONE");

    //TODO: Server Register and Login Connetion
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim() !== '' && password.trim() !== '') {
            onLogin(username.trim(), password.trim(), role)
        } else {
            setAlertOpen(true)
        }
    }

    return (
        <div className="login-container">

            <Stack direction="row" spacing={3} justifyContent="center">
                <IconButton
                    type="button"
                    color={role === 'TEACHER' ? 'primary' : 'default'}
                    onClick={() => setRole('TEACHER')}
                >
                    <SchoolIcon fontSize="large"/>
                </IconButton>

                <IconButton
                    type="button"
                    color={role === 'STUDENT' ? 'primary' : 'default'}
                    onClick={() => setRole('STUDENT')}
                >
                    <PersonIcon fontSize="large"/>
                </IconButton>

                <IconButton
                    type="button"
                    color={role === 'ADMIN' ? 'primary' : 'default'}
                    onClick={() => setRole('ADMIN')}
                >
                    <AdminPanelSettingsIcon fontSize="large"/>
                </IconButton>
            </Stack>
            <Card sx={{minWidth: 320, maxWidth: 600, width: "90%", borderRadius: 4}}>
                <CardContent>
                    <Stack spacing={3}>
                        <Typography variant="h3" component="h1">AI Buddy</Typography>
                        <Typography variant="subtitle1">Dein interaktiver Lernbegleiter</Typography>
                        <Divider aria-hidden="true" orientation="horizontal"/>
                        <Typography variant="h5" component="h2">Login</Typography>

                        {alertOpen && (
                            <Fade in={alertOpen}>
                                <Alert severity="error">Dein Benutzername oder dein Passwort ist falsch!</Alert>
                            </Fade>
                        )}
                        <TextField label="Dein Benutzername" variant="outlined" fullWidth margin="normal"
                                   value={username} onChange={(e) => setUsername(e.target.value)} error={alertOpen}/>
                        <TextField label="Dein Passwort" variant="outlined" fullWidth margin="normal" value={password}
                                   onChange={(e) => setPassword(e.target.value)} error={alertOpen} type="password"/>
                        <Typography variant="body2" align="right">
                            <Link href="/forgot-password" underline="hover">
                                Passwort vergessen?
                            </Link>
                        </Typography>

                        <Button variant="contained" fullWidth onClick={handleSubmit} endIcon={<MeetingRoomIcon/>}
                                disabled={username.trim() === "" || password.trim() === ""}>
                            <Typography variant="button">Ins Klassenzimmer</Typography>
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

