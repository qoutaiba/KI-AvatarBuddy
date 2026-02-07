import {
    Alert,
    createTheme,
    CssBaseline,
    Snackbar,
    ThemeProvider,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { IChatMessage } from "./Interfaces/IChatMessage.ts";
import type { User } from "./classes/User.ts";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./Pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import { OnBoarding } from "./Pages/OnBoarding.tsx";
import AppLayout from "./components/AppLayout/AppLayout.tsx";
import { NotFound } from "./Pages/NotFound.tsx";
import { SubjectSelection } from "./Pages/SubjectSelection.tsx";
import { Administration } from "./Pages/Administration.tsx";
import ClassRoute from "./components/ClassRoute/ClassRoute.tsx";
import SubjectRoute from "./components/SubjectRoute/SubjectRoute.tsx";
import type { Role } from "./types.ts";
import { isChatResponse, isTaskResponse, isStudentProfile } from "./utils/typeguards.ts";
import Admin from "./Pages/Admin.tsx";
import { Subject } from "./classes/Subject.ts";

import { api } from "./api/http";
import { useApiCall } from "./hooks/useApiCall";

const SESSION_KEY = "demo-ai.session";

type Session = {
    username: string;
    role: Role;
    loggedPersonId: number;
    completedOnBoarding: boolean;
    subjects?: string[];
};

function loadSession(): Session | null {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Session;
        if (!parsed || typeof parsed !== "object") return null;
        if (!parsed.role || !parsed.username) return null;
        return parsed;
    } catch {
        return null;
    }
}

function App() {
    const theme = createTheme({
        colorSchemes: { dark: true },
        palette: {
            primary: { main: "#1976d2" },
            secondary: { main: "#9c27b0" },
            background: { default: "#f0f8ff" },
        },
    });

    const initialSession = useMemo(() => loadSession(), []);

    const [completedOnBoarding, setCompletedOnboarding] = useState<boolean>(
        initialSession?.completedOnBoarding ?? false
    );

    const [username, setUsername] = useState<string>(initialSession?.username ?? "");
    const [password, setPassword] = useState<string>(""); // NICHT persistieren
    const [loggedPersonId, setLoggedPersonID] = useState<number>(
        initialSession?.loggedPersonId ?? 0
    );

    const [subjects, setSubjects] = useState<Subject[]>(
        (initialSession?.subjects ?? []).map((name) => new Subject(name, 0))
    );

    const [role, setRole] = useState<Role | null>(initialSession?.role ?? null);

    const [messages, setMessages] = useState<IChatMessage[]>([
        { id: "1", sender: "ai", text: "hi", timestamp: new Date() },
    ]);

    const [, setUsers] = useState<User[]>([]);
    const [localTaskId, setLocalTaskId] = useState<string | null>(null);

    const { error: apiError, setError: setApiError, call } = useApiCall();

    useEffect(() => {
        if (!role || !username) {
            localStorage.removeItem(SESSION_KEY);
            return;
        }

        const payload: Session = {
            username,
            role,
            loggedPersonId,
            completedOnBoarding,
            subjects: subjects
                .map((s) => s.name)
                .filter((n): n is string => Boolean(n)),
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    }, [username, role, loggedPersonId, completedOnBoarding, subjects]);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (role !== "STUDENT") return;
            if (!loggedPersonId) return;
            if (subjects.length > 0) return;

            const profile = await call(() =>
                api.get<unknown>(`/api/user/profile?student_id=${loggedPersonId}`)
            );
            if (!profile || cancelled) return;

            if (isStudentProfile(profile)) {
                const subj = profile.interests.map((n: string) => new Subject(n, 0));
                if (cancelled) return;
                setSubjects(subj);
                setCompletedOnboarding(profile.interests.length > 0);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [role, loggedPersonId, subjects.length, call]);

    const handleLogout = () => {
        localStorage.removeItem(SESSION_KEY);

        setUsername("");
        setPassword("");
        setRole(null);
        setLoggedPersonID(0);
        setCompletedOnboarding(false);
        setSubjects([]);
        setMessages([]);
        setLocalTaskId(null);
        setApiError(null);
    };

    const addStudent = (newStudent: User) => {
        setUsers((prevUsers) => [...prevUsers, newStudent]);
    };

    const handleSend = async (message: IChatMessage) => {
        setMessages((prev) => [...prev, message]);

        const jsonTask = await call(() =>
            api.post<unknown>("/chat", {
                message: message.text,
                session_id: "default",
                collection: "avatar_docs",
                student_id: 0,
            })
        );

        if (!jsonTask) return;

        if (!isChatResponse(jsonTask)) {
            setApiError(
                `Unerwartete Server-Antwort (Chat). Received: ${JSON.stringify(jsonTask)}`
            );
            return;
        }

        setLocalTaskId(jsonTask.task_id);
    };

    const fetchFinalResponse = async () => {
        if (!localTaskId) {
            setApiError("Keine task_id vorhanden – bitte erst eine Nachricht senden.");
            return;
        }

        const json = await call(() => api.get<unknown>(`/tasks/${localTaskId}`));
        if (!json) return;

        if (!isTaskResponse(json)) {
            setApiError(
                `Unerwartete Server-Antwort (Task). Received: ${JSON.stringify(json)}`
            );
            return;
        }

        const answer = json.result?.answer ?? "kein Answer ist vorhanden";

        setMessages((prev) => [
            ...prev,
            {
                id: `${Date.now()}-ai`,
                sender: "ai",
                text: answer,
                timestamp: new Date(),
            },
        ]);

        window.avatarSpreche?.(answer);
    };

    const handleOnboardingComplete = async (interests: string[]) => {
        setCompletedOnboarding(true);

        const ok = await call(() =>
            api.post("/api/user/interests", {
                student_id: loggedPersonId,
                interest_text: interests.toString(),
            })
        );

        if (!ok) return;

        setSubjects(interests.map((n) => new Subject(n, 0)));
    };

    const isLoggedIn = Boolean(role && username && (role === "ADMIN" || loggedPersonId > 0));
    const isTeacher = role === "TEACHER";
    const isStudent = role === "STUDENT";
    const isAdmin = role === "ADMIN";

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme />

                <Snackbar open={Boolean(apiError)} autoHideDuration={6000} onClose={() => setApiError(null)}>
                    <Alert onClose={() => setApiError(null)} severity="error" variant="filled">
                        {apiError}
                    </Alert>
                </Snackbar>

                <Routes>
                    <Route
                        path="/login"
                        element={
                            <Login
                                role={role}
                                setRole={setRole}
                                username={username}
                                setUsername={setUsername}
                                password={password}
                                setPassword={setPassword}
                                setLoggedPersonID={setLoggedPersonID}
                                completedOnBoarding={completedOnBoarding}
                                setSubjects={setSubjects}
                            />
                        }
                    />

                    <Route
                        path="/onboarding"
                        element={
                            <ProtectedRoute condition={isLoggedIn && isStudent}>
                                <OnBoarding onComplete={handleOnboardingComplete} name={username} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute condition={isLoggedIn && isAdmin}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/"
                        element={
                            <ProtectedRoute condition={isLoggedIn}>
                                <AppLayout username={username} onLogout={handleLogout} teacher={isTeacher} />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            index
                            element={
                                <ProtectedRoute condition={isLoggedIn}>
                                    <SubjectSelection username={username} subjects={subjects} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="classroom/:subject"
                            element={
                                <ProtectedRoute condition={isLoggedIn}>
                                    <SubjectRoute
                                        subjects={subjects}
                                        username={username}
                                        messages={messages}
                                        onSend={handleSend}
                                        fetchFinalResponse={fetchFinalResponse}
                                    />
                                </ProtectedRoute>
                            }
                        />

                        {/* ✅ FIX: teacherId durchreichen (statt hardcoded im Component) */}
                        <Route
                            path="administration"
                            element={
                                <ProtectedRoute condition={isLoggedIn && isTeacher && loggedPersonId > 0}>
                                    <Administration teacherId={loggedPersonId} />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="schoolclass/:className/:classId/:subject"
                            element={
                                <ProtectedRoute condition={isLoggedIn && isTeacher}>
                                    <ClassRoute addStudent={addStudent} />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
