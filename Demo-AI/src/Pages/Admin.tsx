import { useState } from "react";
import { Alert, Box, Button, Snackbar, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { api } from "../api/http";
import { useApiCall } from "../hooks/useApiCall";

const Admin: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackText, setSnackText] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    const navigate = useNavigate();

    const { loading, error, setError, call } = useApiCall();

    type TeacherRegisterSuccess = {
        id: number;
        name: string;
        email: string;
    };

    type TeacherRegisterFailure = { detail: string };

    function isTeacherRegisterSuccess(response: unknown): response is TeacherRegisterSuccess {
        const parsed = response as TeacherRegisterSuccess;
        return (
            parsed &&
            typeof parsed.id === "number" &&
            typeof parsed.email === "string" &&
            typeof parsed.name === "string"
        );
    }

    function isTeacherRegisterError(response: unknown): response is TeacherRegisterFailure {
        const parsed = response as TeacherRegisterFailure;
        return parsed && typeof parsed.detail === "string";
    }

    const isValidEmail = email.includes("@");

    const handleAddTeacher = async () => {
        setError(null);

        if (!name.trim() || !email.trim() || !password.trim()) {
            setSnackSeverity("error");
            setSnackText("Bitte alle Felder ausfüllen.");
            setSnackOpen(true);
            return;
        }

        if (!isValidEmail) {
            setSnackSeverity("error");
            setSnackText("Bitte eine gültige Email-Adresse eingeben.");
            setSnackOpen(true);
            return;
        }

        const data = await call(() =>
            api.post<unknown>("/api/teachers/register", {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
            })
        );

        if (!data) {
            // `useApiCall` hat error gesetzt (z.B. 409/400/500)
            setSnackSeverity("error");
            setSnackText(error ?? "Teacher konnte nicht registriert werden.");
            setSnackOpen(true);
            return;
        }

        if (isTeacherRegisterSuccess(data)) {
            setSnackSeverity("success");
            setSnackText(`Teacher "${data.name}" wurde erfolgreich angelegt (ID: ${data.id}).`);
            setSnackOpen(true);

            setName("");
            setEmail("");
            setPassword("");
            return;
        }

        if (isTeacherRegisterError(data)) {
            setSnackSeverity("error");
            setSnackText(data.detail);
            setSnackOpen(true);
            return;
        }

        setSnackSeverity("error");
        setSnackText("Unbekannte Server-Antwort.");
        setSnackOpen(true);
    };

    function hanldeLogOut() {
        localStorage.clear();
        navigate("/login");
    }

    return (
        <Box sx={{ width: "100vw", height: "100vh", padding: "32px" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                }}
            >
                <Typography variant="h4">Administration</Typography>

                <Button variant="outlined" color="error" onClick={hanldeLogOut}>
                    Abmelden
                </Button>
            </Box>

            <Typography variant="h3" gutterBottom>
                Administration
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
                Teacher Registration
            </Typography>

            <Snackbar
                open={snackOpen}
                autoHideDuration={4000}
                onClose={() => setSnackOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} variant="filled">
                    {snackText}
                </Alert>
            </Snackbar>

            <Box sx={{ maxWidth: 400, mt: 2 }}>
                <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                />

                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={email.length > 0 && !isValidEmail}
                    helperText={
                        email.length > 0 && !isValidEmail ? "Bitte eine gültige Email-Adresse eingeben (@ fehlt)" : ""
                    }
                    disabled={loading}
                />

                <TextField
                    label="Passwort"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleAddTeacher}
                    disabled={loading || !name.trim() || !email.trim() || !password.trim() || !isValidEmail}
                >
                    {loading ? "Registriere..." : "Register Teacher"}
                </Button>
            </Box>
        </Box>
    );
};

export default Admin;
