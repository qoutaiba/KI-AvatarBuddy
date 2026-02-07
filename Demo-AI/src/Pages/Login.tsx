import React, { type Dispatch, type SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Divider,
    Fade,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";

import "./Login.css";

import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import type { Role } from "../types.ts";
import {
    isStudentLoginError,
    isStudentLoginSuccess,
    isStudentProfile,
    isTeacherLoginError,
    isTeacherLoginSuccess,
} from "../utils/typeguards.ts";
import { Subject } from "../classes/Subject";

import { api } from "../api/http";
import { useApiCall } from "../hooks/useApiCall";

interface LoginProps {
    username: string;
    setUsername: Dispatch<SetStateAction<string>>;
    password: string;
    setPassword: Dispatch<SetStateAction<string>>;
    role: Role | null;
    setRole: Dispatch<SetStateAction<Role | null>>;
    setLoggedPersonID: Dispatch<SetStateAction<number>>;
    completedOnBoarding: boolean;
    setSubjects: Dispatch<SetStateAction<Subject[]>>;
}

export const Login: React.FC<LoginProps> = (props) => {
    const {
        role,
        password,
        username,
        setUsername,
        setPassword,
        setRole,
        setLoggedPersonID,
        setSubjects,
    } = props;

    const navigate = useNavigate();

    // zentraler Loading/Error State für diese Seite
    const { loading, error, setError, call } = useApiCall();

    // falls du unbedingt das alte {open,message}-State-Format behalten willst:
    // du brauchst es nicht mehr – wir nutzen `error` direkt.
    const [localAlertOpen, setLocalAlertOpen] = useState(false);

    const checkOnBoardingWithServer = async (student_id: number) => {
        try {
            const jsonObBoard = await api.get<unknown>(
                `/api/user/profile?student_id=${student_id}`
            );

            if (isStudentProfile(jsonObBoard)) {
                setSubjects(jsonObBoard.interests.map((name: string) => new Subject(name, 0)));
                return jsonObBoard.interests.length > 0;
            }
            return false;
        } catch {
            // Profil-Check soll Login nicht “hart” blockieren → einfach so tun als ob keine Interessen da sind
            return false;
        }
    };

    const handleLogin = async () => {
        setError(null);
        setLocalAlertOpen(false);

        if (role === "TEACHER") {
            const jsonLogin = await call(() =>
                api.post<unknown>("/api/auth/login", {
                    email: username, // TODO: username oder email?
                    password,
                })
            );

            if (!jsonLogin) {
                // API Fehler (z.B. 401/500) → freundlich überschreiben
                setError("Benutzername oder Passwort ist falsch.");
                setLocalAlertOpen(true);
                return;
            }

            if (isTeacherLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.teacher_id);
                navigate("/administration");
            } else if (isTeacherLoginError(jsonLogin)) {
                setError("Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort.");
                setLocalAlertOpen(true);
            } else {
                setError("Unbekannter Fehler. Versuch später noch mal");
                setLocalAlertOpen(true);
            }
            return;
        }

        if (role === "STUDENT") {
            const jsonLogin = await call(() =>
                api.post<unknown>("/api/auth/student-login", {
                    username,
                    password,
                })
            );

            if (!jsonLogin) {
                setError("Benutzername oder Passwort ist falsch.");
                setLocalAlertOpen(true);
                return;
            }

            if (isStudentLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.student_id);

                const hasInterest = await checkOnBoardingWithServer(jsonLogin.student_id);
                navigate(hasInterest ? "/" : "/onboarding");
            } else if (isStudentLoginError(jsonLogin)) {
                setError("Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort.");
                setLocalAlertOpen(true);
            } else {
                setError("Einloggen war nicht möglich, Server Error.");
                setLocalAlertOpen(true);
            }
            return;
        }

        // Admin (ohne Backend-Call, wie vorher)
        if (role === "ADMIN" && username === "admin" && password === "admin") {
            navigate("/admin");
            return;
        }

        setError("Bitte Rolle wählen und Zugangsdaten eingeben.");
        setLocalAlertOpen(true);
    };

    const showError = Boolean(error) && (localAlertOpen || Boolean(error));

    return (
        <div className="login-container">
            <Card
                sx={{
                    minWidth: 320,
                    maxWidth: 720,
                    width: "90%",
                    borderRadius: 4,
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={4} justifyContent="center" alignItems="center">
                        <IconButton
                            type="button"
                            color={role === "TEACHER" ? "primary" : "default"}
                            onClick={() => {
                                setRole("TEACHER");
                                setError(null);
                                setLocalAlertOpen(false);
                            }}
                        >
                            <SchoolIcon sx={{ fontSize: 64 }} />
                        </IconButton>

                        <IconButton
                            type="button"
                            color={role === "STUDENT" ? "primary" : "default"}
                            onClick={() => {
                                setRole("STUDENT");
                                setError(null);
                                setLocalAlertOpen(false);
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 64 }} />
                        </IconButton>

                        <IconButton
                            type="button"
                            color={role === "ADMIN" ? "primary" : "default"}
                            onClick={() => {
                                setRole("ADMIN");
                                setError(null);
                                setLocalAlertOpen(false);
                            }}
                        >
                            <AdminPanelSettingsIcon sx={{ fontSize: 64 }} />
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
                        <Typography variant="h3" component="h1">
                            AI Buddy
                        </Typography>
                        <Typography variant="subtitle1">Dein interaktiver Lernbegleiter</Typography>
                        <Divider aria-hidden="true" orientation="horizontal" />
                        <Typography variant="h5" component="h2">
                            Login
                        </Typography>

                        {showError && (
                            <Fade in={showError}>
                                <Alert severity="error" onClose={() => setLocalAlertOpen(false)}>
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <TextField
                            label="Dein Benutzername"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            error={Boolean(error)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !(username === "" || password === "") && !loading) {
                                    handleLogin();
                                }
                            }}
                        />

                        <TextField
                            label="Dein Passwort"
                            variant="outlined"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value.trim())}
                            error={Boolean(error)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !(username === "" || password === "") && !loading) {
                                    handleLogin();
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleLogin}
                            endIcon={<LoginIcon />}
                            disabled={loading || !role || username === "" || password === ""}
                        >
                            <Typography variant="button">
                                {loading ? "Anmelden..." : "Anmelden"}
                            </Typography>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );
};
