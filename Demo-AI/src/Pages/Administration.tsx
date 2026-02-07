import React, { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Grid, TextField, Typography } from "@mui/material";

import ClassCard from "../components/ClassCard/ClassCard";
import type { SchoolClass } from "../classes/SchoolClass";
import IngestDataToAvatar from "../components/DataIngestion/IngestDataToAvatar.tsx";

import { api } from "../api/http";
import { useApiCall } from "../hooks/useApiCall";

type AdministrationProps = {
    teacherId: number;
};

export const Administration: React.FC<AdministrationProps> = ({ teacherId }) => {
    const [loadedClasses, setLoadedClasses] = useState<SchoolClass[]>([]);
    const [newClassName, setNewClassName] = useState<string>("");
    const [newSubject, setNewSubject] = useState<string>("");
    const [gradeLvl, setGradeLvl] = useState<string>("");
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    const [openDataIngestion, setOpenDataIngestion] = useState(false);

    const { loading, error, setError, call } = useApiCall();

    const fetchClasses = useCallback(async () => {
        if (!teacherId) return;

        const data = await call(() =>
            api.get<unknown>(`/api/classes?teacher_id=${teacherId}`)
        );
        if (!data) return;

        if (!Array.isArray(data)) {
            setError("Unerwartete Server-Antwort beim Laden der Klassen.");
            return;
        }

        setLoadedClasses(data as SchoolClass[]);
    }, [call, setError, teacherId]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchClasses();
    }, [fetchClasses]);

    const handleAddClass = async () => {
        setError(null);

        const name = newClassName.trim();
        const subject = newSubject.trim();
        const grade_level = gradeLvl.trim();
        if (!name || !subject || !grade_level || !teacherId) return;

        const created = await call(() =>
            api.post<unknown>("/api/classes", {
                name,
                teacher_id: teacherId,
                grade_level,
                subject,
            })
        );

        if (!created) return;

        setNewClassName("");
        setNewSubject("");
        setGradeLvl("");

        await fetchClasses();
    };

    const handleDeleteClass = async () => {
        if (!teacherId) return;
        if (toDeleteId === null || Number.isNaN(toDeleteId)) return;

        const ok = await call(() =>
            api.del<unknown>(`/api/classes/${toDeleteId}?teacher_id=${teacherId}`)
        );
        if (!ok) return;

        setToDeleteId(null);
        await fetchClasses();
    };

    return (
        <Box sx={{ width: "100vw", height: "100vh", overflowY: "auto" }}>
            <Box sx={{ mx: "32px", mt: "32px" }}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{ ml: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                    Verwaltung
                </Typography>
                <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
                    Wählen Sie eine Klasse, um zu beginnen.
                </Typography>

                <IngestDataToAvatar open={openDataIngestion} setOpen={setOpenDataIngestion} />

                {error && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    </Box>
                )}

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                    <TextField
                        label="Klasse"
                        variant="outlined"
                        size="small"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Fach"
                        variant="outlined"
                        size="small"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        disabled={loading}
                    />
                    <TextField
                        label="Klassenstufe"
                        variant="outlined"
                        size="small"
                        value={gradeLvl}
                        onChange={(e) => setGradeLvl(e.target.value)}
                        disabled={loading}
                    />

                    <Button
                        variant="contained"
                        onClick={handleAddClass}
                        disabled={
                            loading ||
                            !teacherId ||
                            !newClassName.trim() ||
                            !newSubject.trim() ||
                            !gradeLvl.trim()
                        }
                    >
                        {loading ? "..." : "Klasse hinzufügen"}
                    </Button>

                    <TextField
                        label="ID zum Löschen"
                        variant="outlined"
                        size="small"
                        value={toDeleteId ?? ""}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v.trim() === "") return setToDeleteId(null);
                            const n = Number(v);
                            setToDeleteId(Number.isNaN(n) ? null : n);
                        }}
                        disabled={loading}
                    />

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeleteClass}
                        disabled={loading || !teacherId || toDeleteId === null}
                    >
                        {loading ? "..." : "Klasse löschen"}
                    </Button>

                    <Button variant="outlined" onClick={fetchClasses} disabled={loading || !teacherId}>
                        Aktualisieren
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => setOpenDataIngestion(true)}
                        disabled={loading}
                    >
                        Ingest öffnen
                    </Button>
                </Box>
            </Box>

            <Grid
                container
                spacing={4}
                justifyContent="flex-start"
                alignItems="flex-start"
                sx={{ m: "32px" }}
            >
                {loadedClasses.map((schoolClass) => (
                    <Grid key={schoolClass.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>
                        <ClassCard id={schoolClass.id} name={schoolClass.name} subject={schoolClass.subject} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Administration;
