import {useState} from "react";
import {Box, Button, TextField, Typography} from "@mui/material";

const Admin: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const isValidEmail = email.includes("@")
    const handleAddTeacher = async () => {

        await fetch("http://localhost:8000/api/teachers/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            }),
        });

        //TODO: Check the response to see if there is email already exists, and print the ID in case of success

        setName("")
        setEmail("")
        setPassword("")

    }

    return (
        <Box sx={{width: "100vw", height: "100vh", padding: "32px"}}>
            <Typography variant="h3" gutterBottom>
                Verwaltung
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
                Teacher hinzufügen
            </Typography>

            <Box sx={{maxWidth: 400, mt: 2}}>
                <TextField
                    label="Name"
                    fullWidth
                    margin="normal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={email.length > 0 && !isValidEmail}
                    helperText={
                        email.length > 0 && !isValidEmail
                            ? "Bitte eine gültige Email-Adresse eingeben (@ fehlt)"
                            : ""
                    }
                />

                <TextField
                    label="Passwort"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    variant="contained"
                    sx={{mt: 2}}
                    onClick={handleAddTeacher}
                >
                    Teacher hinzufügen
                </Button>
            </Box>
        </Box>
    );
};

export default Admin;
