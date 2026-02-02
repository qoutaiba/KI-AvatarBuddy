import React, {type Dispatch, type SetStateAction, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Alert, Button, Card, CardContent, Divider, Fade, IconButton, Stack, TextField, Typography} from '@mui/material'
import LoginIcon from '@mui/icons-material/Login'

import './Login.css';

import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import type {Role} from "../types.ts";
import {
    isStudentLoginError,
    isStudentLoginSuccess,
    isTeacherLoginError,
    isTeacherLoginSuccess
} from "../utils/typeguards.ts";

interface LoginProps {
    username: string,
    setUsername: Dispatch<SetStateAction<string>>,
    password: string,
    setPassword: Dispatch<SetStateAction<string>>,
    role: Role | null
    setRole: Dispatch<SetStateAction<Role | null>>,
    setLoggedPersonID: Dispatch<SetStateAction<number>>
    completedOnBoarding: boolean
}


export const Login: React.FC<LoginProps> = (props) => {
    const {role, password, username, setUsername, setPassword, setRole, setLoggedPersonID} = props

    const navigate = useNavigate();

    const [alert, setAlert] = useState<{ open: boolean, message: string }>({open: false, message: ""})

    const handleLogin = async () => {
        console.log("login payload", {username, password, role});

        if (role === "TEACHER") {
            console.log("Im in Teacher ")
            const teacher_login_request = await fetch("http://localhost:8000/api/auth/login", {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: username, //TODO username or email?
                    password: password
                }),
            });
            if (!teacher_login_request.ok) {
                setAlert({open: true, message: "Benutzername oder Passwort ist falsch."})
                return;
            }

            // wait until server replays with a login response
            const jsonLogin = await teacher_login_request.json();

            console.log(jsonLogin)
            if (isTeacherLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.teacher_id)
                console.log("Alles gut Teacher ")

                navigate("/administration")

            } else if (isTeacherLoginError(jsonLogin)) {
                setAlert({open: true, message: "Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort."})
            } else {
                setAlert({open: true, message: "Unbekannter Fehler. Versuch später noch mal"})
            }
        } else if (role === "STUDENT") {
            console.log("Studen Login: ich gebe " + username + "  und pass " + password)
            const student_login_request = await fetch("http://localhost:8000/api/auth/student-login", {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            });

            if (!student_login_request.ok) {
                setAlert({open: true, message: "Benutzername oder Passwort ist falsch."})
                return;
            }

            // wait until server replays with a login response
            const jsonLogin = await student_login_request.json();
            console.log(jsonLogin)
            if (isStudentLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.student_id)
                console.log("Alles gut Student ")

                navigate("/classroom")
            } else if (isStudentLoginError(jsonLogin)) {
                setAlert({open: true, message: "Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort."})
            } else {
                setAlert({open: true, message: "Einloggen war nicht möglich, Server Error."})
            }

        } else if (username === "admin" && password === "admin") {
            navigate("/admin")
        }
    }

    return (
        <div className="login-container">
            <Card sx={{
                minWidth: 320,
                maxWidth: 720,
                width: "90%", //me "100%"
                borderRadius: 4
            }}>
                <CardContent sx={{p: 4}}>
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
                    <Typography
                        variant="body1"
                        align="center"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: 0.2,
                        }}
                    >
                        Ausgewählt:{" "}
                        {role === null
                            ? "— bitte Rolle wählen"
                            : role === "TEACHER"
                                ? "Lehrer"
                                : role === "STUDENT"
                                    ? "Schüler"
                                    : "Admin"}
                    </Typography>

                    <Stack spacing={3}>
                        <Typography variant="h3" component="h1">AI Buddy</Typography>
                        <Typography variant="subtitle1">Dein interaktiver Lernbegleiter</Typography>
                        <Divider aria-hidden="true" orientation="horizontal"/>
                        <Typography variant="h5" component="h2">Login</Typography>

                        {alert.open && (
                            <Fade in={alert.open}>
                                <Alert severity="error">
                                    {alert.message}
                                </Alert>
                            </Fade>
                        )}

                        <TextField
                            label="Dein Benutzername"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            error={alert.open}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !(username === "" || password === "")) handleLogin()
                            }}
                        />

                        <TextField
                            label="Dein Passwort"
                            variant="outlined"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value.trim())}
                            error={alert.open}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !(username === "" || password === "")) handleLogin()
                            }}
                        />

                        <Button variant="contained" fullWidth onClick={handleLogin} endIcon={<LoginIcon/>}
                                disabled={!role || username === "" || password === ""}>
                            <Typography variant="button">Anmelden</Typography>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    )
}


