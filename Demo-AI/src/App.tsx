import {useState} from 'react';
import {Alert, createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import type {IChatMessage} from './Interfaces/IChatMessage';
import {Login} from "./Pages/Login.tsx";
import Admin from "./Pages/Admin.tsx";
import TeacherUI from "./Pages/TeacherUI.tsx";
import Classroom from "./Pages/Classroom.tsx";

type ChatType = {
    task_id: string,
    collection: string
}
type TaskResult = {
    answer: string,
    documents: string[],
    scores: number[]
}
type TaskResponse = {
    task_id: string,
    status: TaskStatus,
    error?: string,
    result?: TaskResult
}
type TaskStatus = "PENDING" | "FAILURE" | "SUCCESS";
type Teacher = {
    teacher_id: number
}
type Student = {
    "student_id": number,
    "class_id": number
}

function isTeacher(person: unknown): person is Teacher {
    const parsed = person as Teacher;
    return (
        parsed &&
        typeof parsed.teacher_id === "number"
    );
}

function isStudent(person: unknown): person is Student {
    const parsed = person as Student;
    return (
        parsed &&
        typeof parsed.student_id === "number" &&
        typeof parsed.class_id === "number"
    );
}

// here should come isAdmin


function isChatResponse(response: unknown): response is ChatType {
    const parsed = response as ChatType;

    return (
        parsed &&
        typeof parsed.task_id === "string" &&
        typeof parsed.collection === "string"
    );
}

function isTaskStatus(response: unknown): response is TaskStatus {
    const parsed = response as TaskStatus;
    return (parsed && parsed === "PENDING" || parsed == "FAILURE" || parsed == "SUCCESS");
}

function isArrayOf<T extends string | number>(input: unknown, type: T): input is T[] {
    return Array.isArray(input) && input.every(e => typeof e === type)
}

function isTaskResult(input: unknown): input is TaskResult {
    const parsed = input as TaskResult;

    return (
        parsed === undefined || (
            typeof parsed.answer === "string" &&
            isArrayOf(parsed.documents, "string") &&
            isArrayOf(parsed.scores, "number"))
    )
}

function isTaskResponse(response: unknown): response is TaskResponse {
    const parsed = response as TaskResponse;
    return (
        parsed &&
        typeof parsed.task_id === "string" &&
        isTaskStatus(parsed.status) &&
        (parsed.error === undefined || typeof parsed.error === "string") &&
        isTaskResult(parsed.result)
    );
}


async function fetchResponseWithRetryAndTimeout(props: { taskID: string }) {
    const taskID = props

    console.log("fetchFinalResponse", taskID);

    // check on network errors (advanced step)
    while (true) {
        const response = await fetch(`http://localhost:8000/tasks/${taskID}`, {
            method: "GET"
        });


        const json = await response.json();
        if (!isTaskResponse(json)) throw new Error(`Expected a task response of type TaskResponse but received ${JSON.stringify(json)}`);

        if (json.status !== "PENDING") {
            return {error: json.error ?? null, result: json.result ?? null};
        }

        setTimeout(() => {
        }, 1000)
    }
}

const theme = createTheme({
    colorSchemes: {
        dark: true,
    },
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#9c27b0',
        },
        background: {
            default: '#f0f8ff',
        },
    },
});

type TeacherLoginSuccess = {
    teacher_id: number,
}

type TeacherLoginFailure = { detail: string }

function isTeacherLoginSuccess(response: unknown): response is TeacherLoginSuccess {
    const parsed = response as TeacherLoginSuccess;
    return (
        parsed &&
        typeof parsed.teacher_id === "number"
    );
}

function isTeacherLoginError(response: unknown): response is TeacherLoginFailure {
    const parsed = response as TeacherLoginFailure;
    return (
        parsed &&
        typeof parsed && typeof parsed.detail === "string"
    );
}

type StudentLoginSuccess = {
    student_id: number,
    class_id: number
}

type StudentLoginFailure = { detail: string }

function isStudentLoginSuccess(response: unknown): response is StudentLoginSuccess {
    const parsed = response as StudentLoginSuccess;

    return (
        parsed &&
        typeof parsed.student_id === "number" &&
        typeof parsed.class_id === "number"

    );
}


function isStudentLoginError(response: unknown): response is StudentLoginFailure {
    const parsed = response as StudentLoginFailure;
    return (
        parsed &&
        typeof parsed && typeof parsed.detail === "string"
    );
}

function App() {
    const [username, setUsername] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [messages, setMessages] = useState<IChatMessage[]>([
        {id: '1', sender: 'ai', text: 'hi', timestamp: new Date()},
    ])

    const [localTaskId, setLocalTaskId] = useState<string | null>(null);

    type Role = "NONE" | "ADMIN" | "STUDENT" | "TEACHER"

    const [loggedRole, setloggedRole] = useState<Role | null>("NONE")

    const [loggedPersonID, setLoggedPersonID] = useState<number>(0)


    const handleLogin = async (name: string, pw: string, role: Role) => {

        console.count("handleLogin called");
        console.log("payload", {name, pw, role});

        setUsername(name)
        setPassword(pw)


        console.log(role + "  wants to ")
        if (role === "TEACHER") {
            console.log("Im in Teacher ")
            const teacher_login_request = await fetch("http://localhost:8000/api/auth/login", {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: name,
                    password: pw
                }),
            });
            if (!teacher_login_request.ok) {
                throw new Error(`HTTP ${teacher_login_request.status} ${teacher_login_request.statusText}`);
            }
            // wait until server replays with a login response
            const jsonLogin = (await teacher_login_request.json());

            console.log(jsonLogin)
            if (isTeacherLoginSuccess(jsonLogin)) {
                setloggedRole("TEACHER")
                setLoggedPersonID(jsonLogin.teacher_id)
                console.log("Alles gut Teacher ")
                return <Alert> Willkommen ${name}</Alert>
            } else if (isTeacherLoginError(jsonLogin)) {
                return <Alert> Einloggen war nicht möglich, probieren Sie bitte nochmal</Alert>

            } else {
                return <Alert> Unbekannte Antwort vom Server, probieren Sie bitte nochmal</Alert>
            }

        } else if (role === "STUDENT") {

            setUsername(name)
            setPassword(pw)
            console.log("Im in Student ")

            console.log("ich gebe " + name + "  und pass " + pw)
            const student_login_request = await fetch("http://localhost:8000/api/auth/student-login", {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    username: name,
                    password: pw
                }),
            });

            if (!student_login_request.ok) {
                throw new Error(`HTTP ${student_login_request.status} ${student_login_request.statusText}`);
            }
            // wait until server replays with a login response
            const jsonLogin = (await student_login_request.json());
            console.log(jsonLogin)
            if (isStudentLoginSuccess(jsonLogin)) {
                setloggedRole("STUDENT")
                setLoggedPersonID(jsonLogin.student_id)
                console.log("Alles gut Student ")
                return <Alert> Willkommen ${name}</Alert>
            } else if (isStudentLoginError(jsonLogin)) {
                return <Alert> Einloggen war nicht möglich, probieren Sie bitte nochmal</Alert>

            } else {
                return <Alert> Unbekannte Antwort vom Server, probieren Sie bitte nochmal</Alert>
            }

        } else if (username === "admin" && password === "admin") {
            setloggedRole("ADMIN")
            setUsername("")
            setPassword("")
            setloggedRole("NONE");
            return <Alert> Willkommen ${name}</Alert>
        }
    }

    const handleSend = async (message: IChatMessage) => {
        // Die Nachricht aus dem Input in die Megssages packen
        setMessages((prev) => [...prev, message]);
        // Request the server api
        console.log(message)
        const task_request = await fetch("http://localhost:8000/chat", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                message: message.text,
                session_id: "default",
                collection: "avatar_docs",
                student_id: 0,
            }),
        });
        if (!task_request.ok) {
            throw new Error(`HTTP ${task_request.status} ${task_request.statusText}`);
        }

        // wait until server replays with a task_ID
        const jsonTask = (await task_request.json());

        if (!isChatResponse(jsonTask)) {
            throw new Error(`Expected a Chat type as a response from server, instead received ${JSON.stringify(jsonTask)}`);
        }

        const taskID = jsonTask.task_id;

        console.log("my Taskid is", jsonTask.task_id)
        setLocalTaskId(taskID);

        fetchResponseWithRetryAndTimeout({taskID: taskID}).then((response) => {
            console.log("received task response", response);
            if (response.error) {
                console.error(response.error);
            }

            if (response.result) {
                const newMessage: IChatMessage = {
                    id: `${Date.now()}-ai`,
                    sender: "ai",
                    text: response.result.answer,
                    timestamp: new Date(),
                }
                setMessages((prev) => [...prev, newMessage]);
                window.avatarSpreche?.(newMessage.text);
            }
        }).catch((err) => {
            console.error("Schade Malade", err)
        })
    };

    const fetchFinalResponse = async () => {
        console.log("fetchFinalResponse", localTaskId);
        const task_state = await fetch(`http://localhost:8000/tasks/${localTaskId}`, {
            method: "GET"
        });


        if (!task_state.ok) throw new Error(`HTTP ${task_state.status} ${task_state.statusText}`);

        const json = await task_state.json();

        if (!isTaskResponse(json)) {
            throw new Error(`Expected a TaskResponse but received ${JSON.stringify(json)}`);
        }
        //const answer: string = (await task_state.text()).trim();

        const answer = json.result?.answer ?? "kein Answer ist vorhanden"
        console.log("the final answer is " + answer)

        setMessages((prev) => [
            ...prev,
            {
                id: `${Date.now()}-ai`,
                sender: "ai",
                text: answer,
                timestamp: new Date(),
            },
        ]);

        // trigger the avatar to talk
        window.avatarSpreche?.(answer);
    }

    //TODO: Router zum Login zu verschiedenen Pages
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <div className="app-container">
                {loggedRole === "NONE" ? (
                    <Login onLogin={handleLogin}/>
                ) : loggedRole === "ADMIN" ? (
                    <Admin/>
                ) : loggedRole === "TEACHER" ? (
                    <TeacherUI/>
                ) : (
                    <Classroom
                        username={username!}
                        messages={messages}
                        onSend={handleSend}
                        fetchFinalResponse={fetchFinalResponse}
                    />
                )
                }
            </div>
        </ThemeProvider>
    )
}

export default App;


