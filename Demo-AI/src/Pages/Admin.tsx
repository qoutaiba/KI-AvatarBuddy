import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    IconButton,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { api } from "../api/http";
import { useApiCall } from "../hooks/useApiCall";

type AdminProps = {
    creatorId: number; // dev/admin teacher id aus /api/auth/dev-login
};

type TeacherRow = {
    id: number;
    name: string;
    email: string;
    role?: string;
};

type TeacherRegisterSuccess = { id: number; name: string; email: string };
type TeacherRegisterFailure = { detail: string };

function isTeacherRegisterSuccess(x: unknown): x is TeacherRegisterSuccess {
    const p = x as TeacherRegisterSuccess;
    return !!p && typeof p.id === "number" && typeof p.name === "string" && typeof p.email === "string";
}

function isTeacherRegisterError(x: unknown): x is TeacherRegisterFailure {
    const p = x as TeacherRegisterFailure;
    return !!p && typeof p.detail === "string";
}

const Admin: React.FC<AdminProps> = ({ creatorId }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [teachers, setTeachers] = useState<TeacherRow[]>([]);

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackText, setSnackText] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    const navigate = useNavigate();
    const { loading, error, setError, call } = useApiCall();

    const isValidEmail = email.includes("@");

    const openSnack = (severity: "success" | "error", text: string) => {
        setSnackSeverity(severity);
        setSnackText(text);
        setSnackOpen(true);
    };

    const fetchTeachers = async () => {
        if (!creatorId || creatorId <= 0) return;

        const data = await call(() => api.get<unknown>(`/api/teachers?creator_id=${creatorId}`));
        if (!data) return;

        if (!Array.isArray(data)) {
            setError("Unerwartete Server-Antwort beim Laden der Lehrer.");
            return;
        }

        setTeachers(data as TeacherRow[]);
    };

    useEffect(() => {
        fetchTeachers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [creatorId]);

    const handleAddTeacher = async () => {
        setError(null);

        if (!creatorId || creatorId <= 0) {
            openSnack("error", "Kein creator_id vorhanden – bitte als Dev/Admin über Backend einloggen.");
            return;
        }
        if (!name.trim() || !email.trim() || !password.trim()) {
            openSnack("error", "Bitte alle Felder ausfüllen.");
            return;
        }
        if (!isValidEmail) {
            openSnack("error", "Bitte eine gültige Email-Adresse eingeben.");
            return;
        }

        const data = await call(() =>
            api.post<unknown>(`/api/teachers/register?creator_id=${creatorId}`, {
                name: name.trim(),
                email: email.trim(),
                password: password.trim(),
            })
        );

        if (!data) {
            openSnack("error", error ?? "Teacher konnte nicht registriert werden.");
            return;
        }

        if (isTeacherRegisterSuccess(data)) {
            openSnack("success", `Teacher "${data.name}" wurde erfolgreich angelegt (ID: ${data.id}).`);
            setName("");
            setEmail("");
            setPassword("");
            await fetchTeachers();
            return;
        }

        if (isTeacherRegisterError(data)) {
            openSnack("error", data.detail);
            return;
        }

        openSnack("error", "Unbekannte Server-Antwort.");
    };

    const handleDeleteTeacher = async (teacherId: number) => {
        setError(null);

        if (!creatorId || creatorId <= 0) {
            openSnack("error", "Kein creator_id vorhanden – bitte als Dev/Admin einloggen.");
            return;
        }

        const okConfirm = window.confirm(`Teacher (ID: ${teacherId}) wirklich löschen?`);
        if (!okConfirm) return;

        const res = await call(() => api.del<unknown>(`/api/teachers/${teacherId}?creator_id=${creatorId}`));
        if (!res) {
            openSnack("error", error ?? "Teacher konnte nicht gelöscht werden.");
            return;
        }

        openSnack("success", `Teacher (ID: ${teacherId}) gelöscht.`);
        await fetchTeachers();
    };

    const hanldeLogOut = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <Box sx={{ width: "100vw", height: "100vh", padding: "32px" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
                <Typography variant="h4">Administration</Typography>
                <Button variant="outlined" color="error" onClick={hanldeLogOut}>
                    Abmelden
                </Button>
            </Box>

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

            {error && (
                <Box sx={{ mb: 2 }}>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </Box>
            )}

            <Typography variant="h5" gutterBottom>
                Teacher Registration
            </Typography>

            <Box sx={{ maxWidth: 400, mt: 2, mb: 4 }}>
                <TextField label="Name" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={email.length > 0 && !isValidEmail}
                    helperText={email.length > 0 && !isValidEmail ? "Bitte eine gültige Email-Adresse eingeben (@ fehlt)" : ""}
                    disabled={loading}
                />
                <TextField label="Passwort" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />

                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={handleAddTeacher}
                    disabled={loading || creatorId <= 0 || !name.trim() || !email.trim() || !password.trim() || !isValidEmail}
                >
                    {loading ? "Registriere..." : "Register Teacher"}
                </Button>

                <Button sx={{ mt: 1, ml: 1 }} variant="outlined" onClick={fetchTeachers} disabled={loading || creatorId <= 0}>
                    Aktualisieren
                </Button>
            </Box>

            <Typography variant="h5" gutterBottom>
                Teachers
            </Typography>

            <Table size="small" sx={{ maxWidth: 900 }}>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell align="right"><strong>Aktion</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {teachers.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.id}</TableCell>
                            <TableCell>{t.name}</TableCell>
                            <TableCell>{t.email}</TableCell>
                            <TableCell align="right">
                                <IconButton color="error" onClick={() => handleDeleteTeacher(t.id)} disabled={loading || creatorId <= 0}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {teachers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4}>Keine Lehrer gefunden.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
};

export default Admin;
