import React from "react";
import {Box, Card, CardContent, Typography} from "@mui/material";

const TeacherUI: React.FC = () => {
    return (
        <Box sx={{width: "100vw", height: "100vh", overflowY: "auto"}}>
            <Box sx={{margin: "32px"}}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Lehrerbereich
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Willkommen im Teacher Dashboard.
                </Typography>

                <Card sx={{mt: 4, maxWidth: 600, borderRadius: 3}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Dummy Teacher UI
                        </Typography>
                        <Typography variant="body1">
                            Hier werden später Lehrer-Funktionen erscheinen, z.B.:
                        </Typography>
                        <Typography variant="body2" sx={{mt: 1}}>
                            • Klassen verwalten<br/>
                            • Schüler einsehen<br/>
                            • Aufgaben erstellen<br/>
                            • Fortschritt analysieren
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default TeacherUI;
