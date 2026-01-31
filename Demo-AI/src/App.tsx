import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Login } from './Pages/Login'
import { SubjectSelection } from './Pages/SubjectSelection'
import type { IChatMessage } from './Interfaces/IChatMessage'
import { Subject } from '../src/classes/Subject'
import { SchoolClass } from './classes/SchoolClass'
import { NotFound } from './Pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import SubjectRoute from './components/SubjectRoute/SubjectRoute'
import AppLayout from './components/AppLayout/AppLayout'
import { OnBoarding } from './Pages/OnBoarding'
import { Administration } from './Pages/Administration'
import ClassRoute from './components/ClassRoute/ClassRoute'
import { User } from './classes/User'

type ChatType = {
    task_id: string,
    collection: string
}

function isChatResponse(response: unknown): response is ChatType {
    const parsed = response as ChatType;

    return (
        parsed &&
        typeof parsed.task_id === "string" &&
        typeof parsed.collection === "string"
    );
}

type TaskStatus = "PENDING" | "FAILURE" | "SUCCESS";

function isTaskStatus(response: TaskStatus): response is TaskStatus {
    const parsed = response as TaskStatus;

    return (parsed && parsed === "PENDING" || parsed == "FAILURE" || parsed == "SUCCESS");
}

type TaskResult = {
    answer: string,
    documents: string[],
    scores: number[]
}

function isArrayOf<T extends string | number>(input: unknown, type: T): input is T[] {
    return Array.isArray(input) && input.every(e => typeof e === type)
}

function isTaskResult(input: unknown): input is TaskResult {
    const parsed = input as TaskResult;

    // console.log({
    //     isAnswer: typeof parsed.answer === "string",
    //     isDocs: isArrayOf(parsed.documents, "string"),
    //     isScores: isArrayOf(parsed.scores, "number")
    // })
    return (
        parsed === undefined || (
            typeof parsed.answer === "string" &&
            isArrayOf(parsed.documents, "string") &&
            isArrayOf(parsed.scores, "number"))

    )

}

type TaskResponse = {
    task_id: string,
    status: TaskStatus,
    error?: string,
    result?: TaskResult
}

function isTaskResponse(response: unknown): response is TaskResponse {
    const parsed = response as TaskResponse;
    // console.log({
    //     isId: typeof parsed.task_id === "string",
    //     isStatus: isTaskStatus(parsed.status),
    //     isError: (parsed.error === undefined || typeof parsed.error === "string"),
    //     isTaskResult: isTaskResult(parsed.result)
    // })
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

        // if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

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

function App() {

    const AI_Response: string[] = [
        'Interessante Frage!',
        'Darüber können wir sprechen',
        'Gute Beobachtung.',
        'Lass uns das gemeinsam anschauen.',
    ]


    const [completedOnBoarding, setCompletedOnboarding] = useState<boolean>(false)
    const [loggedInAsTeacher, setLoggedInAsTeacher] = useState<boolean>(() => {
        return sessionStorage.getItem("isTeacher") === "true"; // nur für Demo
    })
    const [username, setUsername] = useState<string | null>(() => {
        return sessionStorage.getItem("username") // nur für Demo
    })
    const [password, setPassword] = useState<string | null>(() => {
        return sessionStorage.getItem("password") // nur für Demo
    })
    const [messages, setMessages] = useState<IChatMessage[]>([
        { id: '1', sender: 'ai', text: 'hi', timestamp: new Date() },
    ])
    const [subjects, setSubjects] = useState<Subject[] | null>([
        new Subject("Deutsch"),
        new Subject("Englisch"),
        new Subject("Französisch"),
        new Subject("Latein"),
        new Subject("Mathematik"),
        new Subject("Physik", 2),
        new Subject("Informatik"),
        new Subject("Biologie"),
        new Subject("Chemie"),
        new Subject("Geographie"),
        new Subject("Kunst"),
        new Subject("Musik", 1),
        new Subject("Sport"),
  ])

    const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([
        new SchoolClass(5, "a"),
        new SchoolClass(7, "a"),
        new SchoolClass(10, "b"),
  ])

    const [users, setUsers] = useState<User[]>([])

    const [localTaskId, setLocalTaskId] = useState<string | null>(null);
    const addStudent = (newStudent: User) => {
        setUsers((prevUsers) => [...prevUsers, newStudent]);
    }
    const handleLogin = (name: string, pw: string) => {
        setUsername(name)
        setPassword(pw)

        sessionStorage.setItem("username", name) // nur für Demo
        sessionStorage.setItem("password", pw) // nur für Demo

        if (name.toLowerCase() === "lehrer") {
        sessionStorage.setItem("isTeacher", "true") // nur für Demo
        setLoggedInAsTeacher(true)
        } else {
        sessionStorage.setItem("isTeacher", "false")
        }
    }
    const handleLogout = () => {
        setUsername(null)
        setPassword(null)

        sessionStorage.removeItem("username") // nur für Demo
        sessionStorage.removeItem("password") // nur für Demo
        sessionStorage.removeItem("isTeacher") // nur für Demo

        setLoggedInAsTeacher(false)
    }

    const handleSend = async (message: IChatMessage) => {
        // Die -Nachricht aus dem Input in die Megssages packen
        setMessages((prev) => [...prev, message]);

        setTimeout(() => {
            const randomText =
            AI_Response[Math.floor(Math.random() * AI_Response.length)];
            const aiMessage: IChatMessage = {
                id: Date.now().toString() + '-ai',
                sender: 'ai',
                text: randomText,
                timestamp: new Date(),
                };  
                
        setMessages((prev) => [...prev, aiMessage]);
        }, 1000);

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
    const handleOnboardingComplete = (interests: string[]) => {
                console.log('User interests:', interests);
                setCompletedOnboarding(true);
            };
    //TODO: Router zum Login zu verschiedenen Pages
    return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme/>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} completedOnBoarding={completedOnBoarding} />} />
          <Route path="/onboarding" element={<ProtectedRoute condition={!!username && !!password}><OnBoarding onComplete={handleOnboardingComplete} name={username!} /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute condition={!!username && !!password}><AppLayout username={username!} onLogout={handleLogout} teacher={loggedInAsTeacher} /></ProtectedRoute>} >
            <Route index element={<ProtectedRoute condition={!!username && !!password}><SubjectSelection username={username!} subjects={subjects} /></ProtectedRoute>} />
            <Route path="classroom/:subject" element={<ProtectedRoute condition={!!username && !!password}><SubjectRoute subjects={subjects} username={username!} messages={messages} onSend={handleSend} fetchFinalResponse={fetchFinalResponse} /></ProtectedRoute>} />
            <Route path="administration" element={<ProtectedRoute condition={!!username && !!password && !!loggedInAsTeacher}><Administration schoolClasses={schoolClasses} /></ProtectedRoute>} />
            <Route path="schoolclass/:schoolClass" element={<ProtectedRoute condition={!!username && !!password && !!loggedInAsTeacher}><ClassRoute schoolClasses={schoolClasses} users={users} addStudent={addStudent} /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App;
