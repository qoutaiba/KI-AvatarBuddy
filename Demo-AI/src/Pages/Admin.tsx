import {useState} from "react";
import {Alert, Box, Button, Snackbar, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";

const Admin: React.FC = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [snackOpen, setSnackOpen] = useState(false);
    const [snackText, setSnackText] = useState("");
    const [snackSeverity, setSnackSeverity] = useState<"success" | "error">("success");

    const navigate = useNavigate()

    type TeacherRegisterSuccess = {
        id: number,
        name: string,
        email: string
    }

    type TeacherRegisterFailure = { detail: string }

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
        return (
            parsed &&
            typeof parsed && typeof parsed.detail === "string"
        );
    }


    const isValidEmail = email.includes("@")
    const handleAddTeacher = async () => {

        const res = await fetch("http://localhost:8000/api/teachers/register", {
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

        const data = await res.json();

        if (isTeacherRegisterSuccess(data)) {
            setSnackSeverity("success");
            setSnackText(`Teacher "${data.name}" was added successfully with  (ID: ${data.id}).`);
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


        //TODO: Check the response to see if there is email already exists, and print the ID in case of success

        setName("")
        setEmail("")
        setPassword("")

    }

    function hanldeLogOut() {
        localStorage.clear()
        navigate("/login")
    }

    return (
        <Box sx={{width: "100vw", height: "100vh", padding: "32px"}}>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 4,
                }}
            >
                <Typography variant="h4">
                    Administration
                </Typography>

                <Button
                    variant="outlined"
                    color="error"
                    onClick={hanldeLogOut}
                >
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
                onClose={() => {
                    setSnackOpen(false)
                }}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            >
                <Alert
                    onClose={() => setSnackOpen(false)}
                    severity={snackSeverity}
                    variant="filled"
                >
                    {snackText}
                </Alert>
            </Snackbar>
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
                    Register Teacher
                </Button>
            </Box>
        </Box>
    );
};

export default Admin;
