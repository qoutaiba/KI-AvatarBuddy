export type ChatType = {
    task_id: string,
    collection: string
}
export type TaskResult = {
    answer: string,
    documents: string[],
    scores: number[]
}
export type TaskResponse = {
    task_id: string,
    status: TaskStatus,
    error?: string,
    result?: TaskResult
}
export type TaskStatus = "PENDING" | "FAILURE" | "SUCCESS";
export type Teacher = {
    teacher_id: number
}
export type Student = {
    "student_id": number,
    "class_id": number
}
export type TeacherLoginSuccess = {
    teacher_id: number,
}
export type TeacherLoginFailure = { detail: string }
export type StudentLoginSuccess = {
    student_id: number,
    class_id: number
}

export type StudentProfile = {
    "student_id": number,
    "student_name": string,
    "class_id": number,
    "class_name": string,
    "interests": []
}

export type StudentLoginFailure = { detail: string }
export type Role = "ADMIN" | "STUDENT" | "TEACHER"


