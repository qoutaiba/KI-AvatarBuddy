import React, { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import type { User } from "../classes/User";
import { generatePassword } from "../components/HelperFunctions/GeneratePassword";
import { api } from "../api/http";
import { useApiCall } from "../hooks/useApiCall";

interface IStudentListProps {
    classId: number;
    className: string;
    addStudent: (student: User) => void;
}

type StudentFromBackend = {
    id: number;
    name: string;
    username: string;
    class_id: number;
    password?: string;
};

const TEACHER_ID = 3; // TODO: aus Login/State ziehen statt hardcoden

const StudentList: React.FC<IStudentListProps> = ({ classId, className, addStudent }) => {
    const [students, setStudents] = useState<User[]>([]);
    const [newName, setNewName] = useState<string>("");
    const [newUsername, setNewUsername] = useState<string>("");
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const { loading, error, setError, call } = useApiCall();

    const fetchStudents = useCallback(async () => {
        const data = await call(() =>
            api.get<unknown>(`/api/classes/${classId}/students?teacher_id=${TEACHER_ID}`)
        );

        if (!data) return;

        if (!Array.isArray(data)) {
            setError("Unerwartete Server-Antwort beim Laden der Schüler.");
            return;
        }

        setStudents(
            (data as StudentFromBackend[]).map((s) => ({
                ...s,
                password: s.password || "",
                currentClass: className,
            }))
        );
    }, [call, classId, className, setError]);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleAddStudent = async () => {
        const name = newName.trim();
        const username = newUsername.trim();
        if (!name || !username) return;

        const password = generatePassword();

        const created = await call(() =>
            api.post<unknown>(`/api/classes/${classId}/students`, {
                name,
                username,
                class_id: classId,
                password,
            })
        );

        if (!created) return;

        const json = created as StudentFromBackend;

        const newStudent: User = {
            id: json.id,
            name: json.name,
            username: json.username,
            class_id: json.class_id,
            password, // Hinweis: Passwörter im UI anzeigen ist nicht ideal – später entfernen/als "copy once" lösen
            currentClass: className,
        };

        setStudents((prev) => [...prev, newStudent]);
        addStudent(newStudent);

        setNewName("");
        setNewUsername("");
    };

    const handleDeleteStudent = async () => {
        if (deleteId === null || Number.isNaN(deleteId)) return;

        const ok = await call(() =>
            api.del<unknown>(`/api/user/student/${deleteId}?teacher_id=${TEACHER_ID}`)
        );

        if (!ok) return;

        setStudents((prev) => prev.filter((s) => s.id !== deleteId));
        setDeleteId(null);
    };

    return (
        <Box sx={{ width: "100vw", height: "100vh", overflowY: "auto" }}>
            <Box sx={{ mx: 4, mt: 4 }}>
                <Typography variant="h3" gutterBottom>
                    {className}
                </Typography>

                {error && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
                    <TextField
                        label="Name des Schülers"
                        variant="outlined"
                        size="small"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Username"
                        variant="outlined"
                        size="small"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddStudent}
                        disabled={loading || !newName.trim() || !newUsername.trim()}
                    >
                        {loading ? "..." : "Hinzufügen"}
                    </Button>

                    <TextField
                        label="ID zum Löschen"
                        variant="outlined"
                        size="small"
                        value={deleteId ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v.trim() === "") {
                                setDeleteId(null);
                                return;
                            }
                            const n = Number(v);
                            setDeleteId(Number.isNaN(n) ? null : n);
                        }}
                        disabled={loading}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeleteStudent}
                        disabled={loading || deleteId === null}
                    >
                        {loading ? "..." : "Löschen"}
                    </Button>

                    <Button variant="outlined" onClick={fetchStudents} disabled={loading}>
                        Aktualisieren
                    </Button>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{
                        maxHeight: "60vh",
                        overflowY: "auto",
                    }}
                >
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Name</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Username</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Password</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.id}</TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>{student.username}</TableCell>
                                    <TableCell>{student.password}</TableCell>
                                </TableRow>
                            ))}
                            {students.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography variant="body2">Keine Schüler gefunden.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default StudentList;
