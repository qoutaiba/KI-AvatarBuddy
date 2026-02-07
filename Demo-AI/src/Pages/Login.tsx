import React, { type Dispatch, type SetStateAction } from "react";
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

type DevLoginSuccess = {
    dev_id: number;
    role: string; // "dev"
};

function isDevLoginSuccess(x: unknown): x is DevLoginSuccess {
    const p = x as DevLoginSuccess;
    return !!p && typeof p.dev_id === "number" && typeof p.role === "string";
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
    const { loading, error, setError, call } = useApiCall();

    const checkOnBoardingWithServer = async (student_id: number) => {
        try {
            const jsonObBoard = await api.get<unknown>(`/api/user/profile?student_id=${student_id}`);

            if (isStudentProfile(jsonObBoard)) {
                setSubjects(jsonObBoard.interests.map((name: string) => new Subject(name, 0)));
                return jsonObBoard.interests.length > 0;
            }
            return false;
        } catch {
            return false;
        }
    };

    const handleLogin = async () => {
        setError(null);

        if (role === "TEACHER") {
            const jsonLogin = await call(() =>
                api.post<unknown>("/api/auth/login", {
                    email: username,
                    password,
                })
            );

            if (!jsonLogin) {
                setError("Benutzername oder Passwort ist falsch.");
                return;
            }

            if (isTeacherLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.teacher_id);
                navigate("/administration");
            } else if (isTeacherLoginError(jsonLogin)) {
                setError("Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort.");
            } else {
                setError("Unbekannter Fehler. Versuch später noch mal");
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
                return;
            }

            if (isStudentLoginSuccess(jsonLogin)) {
                setLoggedPersonID(jsonLogin.student_id);

                const hasInterest = await checkOnBoardingWithServer(jsonLogin.student_id);
                navigate(hasInterest ? "/" : "/onboarding");
            } else if (isStudentLoginError(jsonLogin)) {
                setError("Einloggen war nicht möglich, bitte prüfen Sie E-Mail/Passwort.");
            } else {
                setError("Einloggen war nicht möglich, Server Error.");
            }
            return;
        }

        if (role === "ADMIN") {
            const json = await call(() =>
                api.post<unknown>("/api/auth/dev-login", {
                    email: username,
                    password,
                })
            );

            if (!json) {
                setError("Admin-Login fehlgeschlagen. Bitte E-Mail/Passwort prüfen.");
                return;
            }

            if (!isDevLoginSuccess(json)) {
                setError("Unerwartete Server-Antwort beim Admin-Login.");
                return;
            }

            setLoggedPersonID(json.dev_id);
            navigate("/admin");
            return;
        }

        setError("Bitte Rolle wählen und Zugangsdaten eingeben.");
    };

    const showError = Boolean(error);

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
                                <Alert severity="error" onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <TextField
                            label={role === "TEACHER" || role === "ADMIN" ? "Deine E-Mail" : "Dein Benutzername"}
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            error={Boolean(error)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && username !== "" && password !== "" && !loading) {
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
                                if (e.key === "Enter" && username !== "" && password !== "" && !loading) {
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
                            <Typography variant="button">{loading ? "Anmelden..." : "Anmelden"}</Typography>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </div>
    );
};
