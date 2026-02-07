import { type Dispatch, type SetStateAction, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    FormControlLabel,
    TextField,
    Typography,
} from "@mui/material";

import { api } from "../../api/http";
import { useApiCall } from "../../hooks/useApiCall";

export default function IngestDataToAvatar(prop: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) {
    const { open, setOpen } = prop;

    const [ingestedData, setIngestedData] = useState("");
    const [subject, setSubject] = useState("");
    const [source, setSource] = useState("");
    const [metaClicked, setMetaClicked] = useState(false);

    // ersetzt das lokale loading/status Handling
    const { loading, error, setError, call } = useApiCall();
    const [status, setStatus] = useState<string>("");

    type IngestBody = {
        text: string;
        metadata?: {
            class_id: number;
            subject: string;
            source: string;
        };
    };

    const resetForm = () => {
        setIngestedData("");
        setSubject("");
        setSource("");
        setMetaClicked(false);
        setStatus("");
        setError(null);
    };

    const handleSubmit = async () => {
        setStatus("");
        setError(null);

        const body: IngestBody = { text: ingestedData.trim() };

        if (metaClicked) {
            // TODO: class_id / source / subject korrekt aus UI übernehmen (statt hardcoded)
            body.metadata = {
                source: source.trim(),
                subject: subject.trim(),
                class_id: 12,
            };
        }

        const ok = await call(() => api.post("/ingest", body));
        if (!ok) return;

        setStatus("Erfolg");
        setIngestedData("");
    };

    return (
        <Dialog
            open={open}
            onClose={() => {
                setOpen(false);
                resetForm();
            }}
            fullWidth
            maxWidth="sm"
        >
            <Box sx={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <Typography variant="h6">Daten ins Avatar-Wissen ingestieren</Typography>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {status && <Alert severity="success">{status}</Alert>}

                <TextField
                    onChange={(e) => setIngestedData(e.target.value)}
                    value={ingestedData}
                    label="Data to ingest.."
                    required
                    multiline
                    minRows={4}
                    disabled={loading}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={metaClicked}
                            onChange={() => setMetaClicked((prev) => !prev)}
                            disabled={loading}
                        />
                    }
                    label="Metadaten hinzufügen"
                />

                {metaClicked && (
                    <>
                        <TextField
                            label="source"
                            onChange={(e) => setSource(e.target.value)}
                            value={source}
                            disabled={loading}
                        />
                        <TextField
                            label="subject"
                            onChange={(e) => setSubject(e.target.value)}
                            value={subject}
                            disabled={loading}
                        />
                    </>
                )}

                <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}>
                    <Button
                        onClick={() => {
                            setOpen(false);
                            resetForm();
                        }}
                        variant="outlined"
                        disabled={loading}
                    >
                        Close
                    </Button>

                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={
                            loading ||
                            !ingestedData.trim() ||
                            (metaClicked && (!source.trim() || !subject.trim()))
                        }
                    >
                        {loading ? "Sende..." : "Send Information"}
                    </Button>
                </Box>
            </Box>
        </Dialog>
    );
}
