import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import {useState} from "react";
import type {IChatMessage} from "./Interfaces/IChatMessage.ts";
import type {User} from "./classes/User.ts";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Login} from "./Pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.tsx";
import {OnBoarding} from "./Pages/OnBoarding.tsx";
import AppLayout from "./components/AppLayout/AppLayout.tsx";
import {NotFound} from "./Pages/NotFound.tsx";
import {SubjectSelection} from "./Pages/SubjectSelection.tsx";
import {Administration} from "./Pages/Administration.tsx";
import ClassRoute from "./components/ClassRoute/ClassRoute.tsx";
import SubjectRoute from "./components/SubjectRoute/SubjectRoute.tsx";
import type {Role} from "./types.ts";
import {isChatResponse, isTaskResponse} from "./utils/typeguards.ts";
import Admin from "./Pages/Admin.tsx";
import type {Subject} from "./classes/Subject.ts";


// async function fetchResponseWithRetryAndTimeout(props: { taskID: string }) {
//     const {taskID} = props
//
//     console.log("fetchResponseWithRetryAndTimeout", taskID);
//
//     // check on network errors (advanced step)
//     while (true) {
//         const response = await fetch(`http://localhost:8000/tasks/${taskID}`, {
//             method: "GET"
//         });
//
//
//         const json = await response.json();
//         if (!isTaskResponse(json)) throw new Error(`Expected a task response of type TaskResponse but received ${JSON.stringify(json)}`);
//
//         if (json.status !== "PENDING") {
//             return {error: json.error ?? null, result: json.result ?? null};
//         }
//
//         setTimeout(() => {
//         }, 1000)
//     }
// }

function App() {
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

    const [completedOnBoarding, setCompletedOnboarding] = useState<boolean>(false)

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [loggedPersonId, setLoggedPersonID] = useState<number>(0)

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [role, setRole] = useState<Role | null>(null)
    const [messages, setMessages] = useState<IChatMessage[]>([
        {id: '1', sender: 'ai', text: 'hi', timestamp: new Date()},
    ])


    const [, setUsers] = useState<User[]>([])


    const [localTaskId, setLocalTaskId] = useState<string | null>(null);
    const handleLogout = () => {
        setUsername("");
        setPassword("");
        setRole(null);
        setSubjects([]);
        setMessages([]);

    }

    const addStudent = (newStudent: User) => {
        setUsers((prevUsers) => [...prevUsers, newStudent]);
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

        // fetchResponseWithRetryAndTimeout({taskID: taskID}).then((response) => {
        //     console.log("received task response", response);
        //     if (response.error) {
        //         console.error(response.error);
        //     }
        //
        //     if (response.result) {
        //         const newMessage: IChatMessage = {
        //             id: `${Date.now()}-ai`,
        //             sender: "ai",
        //             text: response.result.answer,
        //             timestamp: new Date(),
        //         }
        //         setMessages((prev) => [...prev, newMessage]);
        //         window.avatarSpreche?.(newMessage.text);
        //     }
        // }).catch((err) => {
        //     console.error("Schade Malade", err)
        // })
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

        window.avatarSpreche?.(answer);
    }

    const handleOnboardingComplete = async (interests: string[]) => {
        console.log('User interests:', interests);
        setCompletedOnboarding(true);
        await fetch("http://localhost:8000/api/user/interests", {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                student_id: loggedPersonId,
                interest_text: interests.toString()
            }),
        });

    };

    const isLoggedIn = Boolean(password && username)
    const isTeacher = role === "TEACHER"
    const isStudent = role === "STUDENT"
    const isAdmin = role === "ADMIN"
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline enableColorScheme/>
                <Routes>
                    <Route path="/login"
                           element={<Login
                               role={role}
                               setRole={setRole}
                               username={username}
                               setUsername={setUsername}
                               password={password}
                               setPassword={setPassword}
                               setLoggedPersonID={setLoggedPersonID}
                               completedOnBoarding={completedOnBoarding}
                               setSubjects={setSubjects}
                           />}

                    />

                    <Route path="/onboarding" element={
                        <ProtectedRoute condition={isLoggedIn && isStudent}>
                            <OnBoarding onComplete={handleOnboardingComplete} name={username}/>
                        </ProtectedRoute>}
                    />

                    <Route path="/admin" element={
                        <ProtectedRoute condition={isLoggedIn && isAdmin}>
                            <Admin/>
                        </ProtectedRoute>}
                    />
                    <Route path="/"
                           element={
                               <ProtectedRoute condition={isLoggedIn}>
                                   <AppLayout username={username}
                                              onLogout={handleLogout}
                                              teacher={isTeacher}/>
                               </ProtectedRoute>
                           }>
                        <Route index element={
                            <ProtectedRoute condition={isLoggedIn}>
                                <SubjectSelection username={username} subjects={subjects}/>
                            </ProtectedRoute>}/>
                        <Route path="/classroom"
                               element={
                                   <ProtectedRoute condition={isLoggedIn}>
                                       <SubjectRoute
                                           subjects={[]}
                                           username={username}
                                           messages={messages}
                                           onSend={handleSend}
                                           fetchFinalResponse={fetchFinalResponse}/>
                                   </ProtectedRoute>
                               }
                        />
                        <Route path="administration"
                               element={
                                   <ProtectedRoute condition={isLoggedIn && isTeacher}>
                                       <Administration/>
                                   </ProtectedRoute>
                               }
                        />
                        <Route path="schoolclass/:className/:classId/:subject"
                               element={
                                   <ProtectedRoute condition={isLoggedIn && isTeacher}>
                                       <ClassRoute addStudent={addStudent}/>
                                   </ProtectedRoute>
                               }
                        />
                        <Route path="*" element={<NotFound/>}/>
                    </Route>
                </Routes>
            </ThemeProvider>
        </BrowserRouter>
    )
}

export default App;
