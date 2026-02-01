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
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 720,        // größer als vorher (600)
                    borderRadius: 4,
                }}
            >
                <CardContent sx={{p: 4}}> {/* mehr Innenabstand */}
                    <Stack spacing={3}>
                        {/* ROLE ICONS – ganz oben, Teil der Form */}
                        <Stack
                            direction="row"
                            spacing={4}
                            justifyContent="center"
                            alignItems="center"
                        >
                            <IconButton
                                type="button"
                                color={role === "TEACHER" ? "primary" : "default"}
                                onClick={() => setRole("TEACHER")}
                            >
                                <SchoolIcon sx={{fontSize: 64}}/>
                            </IconButton>

                            <IconButton
                                type="button"
                                color={role === "STUDENT" ? "primary" : "default"}
                                onClick={() => setRole("STUDENT")}
                            >
                                <PersonIcon sx={{fontSize: 64}}/>
                            </IconButton>

                            <IconButton
                                type="button"
                                color={role === "ADMIN" ? "primary" : "default"}
                                onClick={() => setRole("ADMIN")}
                            >
                                <AdminPanelSettingsIcon sx={{fontSize: 64}}/>
                            </IconButton>
                        </Stack>

                        {/* SELECTED ROLE LINE */}
                        <Typography
                            variant="body1"
                            align="center"
                            sx={{
                                fontWeight: 600,
                                letterSpacing: 0.2,
                            }}
                        >
                            Ausgewählt:{" "}
                            {role === "NONE"
                                ? "— bitte Rolle wählen"
                                : role === "TEACHER"
                                    ? "Lehrer"
                                    : role === "STUDENT"
                                        ? "Schüler"
                                        : "Admin"}
                        </Typography>

                        {/* HEADER */}
                        <Stack spacing={1} alignItems="center">
                            <Typography variant="h3" component="h1">
                                AI Buddy
                            </Typography>
                            <Typography variant="subtitle1">
                                Dein interaktiver Lernbegleiter
                            </Typography>
                        </Stack>

                        <Divider/>

                        <Typography variant="h5" component="h2">
                            Login
                        </Typography>


                        {alertOpen && (
                            <Fade in={alertOpen}>
                                <Alert severity="error">
                                    Dein Benutzername oder dein Passwort ist falsch!
                                </Alert>
                            </Fade>
                        )}


                        <TextField
                            label="Dein Benutzername"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={alertOpen}
                        />

                        <TextField
                            label="Dein Passwort"
                            variant="outlined"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={alertOpen}
                        />

                        <Typography variant="body2" align="right">
                            <Link href="/forgot-password" underline="hover">
                                Passwort vergessen?
                            </Link>
                        </Typography>

                        {/* SUBMIT */}
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            endIcon={<MeetingRoomIcon/>}
                            disabled={
                                role === "NONE" ||
                                username.trim() === "" ||
                                password.trim() === ""
                            }
                            sx={{py: 1.2}}  // Button etwas höher
                        >
                            <Typography variant="button">Ins Klassenzimmer</Typography>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );

}

