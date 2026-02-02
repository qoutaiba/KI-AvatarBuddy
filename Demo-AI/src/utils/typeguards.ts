import type {
    ChatType,
    Student,
    StudentLoginFailure,
    StudentLoginSuccess,
    TaskResponse,
    TaskResult,
    TaskStatus,
    Teacher,
    TeacherLoginFailure,
    TeacherLoginSuccess
} from "../types.ts";

export function isTeacher(person: unknown): person is Teacher {
    const parsed = person as Teacher;
    return (
        parsed &&
        typeof parsed.teacher_id === "number"
    );
}

export function isStudent(person: unknown): person is Student {
    const parsed = person as Student;
    return (
        parsed &&
        typeof parsed.student_id === "number" &&
        typeof parsed.class_id === "number"
    );
}

export function isChatResponse(response: unknown): response is ChatType {
    const parsed = response as ChatType;

    return (
        parsed &&
        typeof parsed.task_id === "string" &&
        typeof parsed.collection === "string"
    );
}

export function isTaskStatus(response: unknown): response is TaskStatus {
    const parsed = response as TaskStatus;
    return (parsed && parsed === "PENDING" || parsed == "FAILURE" || parsed == "SUCCESS");
}

export function isArrayOf<T extends string | number>(input: unknown, type: T): input is T[] {
    return Array.isArray(input) && input.every(e => typeof e === type)
}

export function isTaskResult(input: unknown): input is TaskResult {
    const parsed = input as TaskResult;

    return (
        parsed === undefined || (
            typeof parsed.answer === "string" &&
            isArrayOf(parsed.documents, "string") &&
            isArrayOf(parsed.scores, "number"))
    )
}

export function isTaskResponse(response: unknown): response is TaskResponse {
    const parsed = response as TaskResponse;
    return (
        parsed &&
        typeof parsed.task_id === "string" &&
        isTaskStatus(parsed.status) &&
        (parsed.error === undefined || typeof parsed.error === "string") &&
        isTaskResult(parsed.result)
    );
}

export function isTeacherLoginSuccess(response: unknown): response is TeacherLoginSuccess {
    const parsed = response as TeacherLoginSuccess;
    return (
        parsed &&
        typeof parsed.teacher_id === "number"
    );
}

export function isTeacherLoginError(response: unknown): response is TeacherLoginFailure {
    const parsed = response as TeacherLoginFailure;
    return (
        parsed &&
        typeof parsed && typeof parsed.detail === "string"
    );
}

export function isStudentLoginSuccess(response: unknown): response is StudentLoginSuccess {
    const parsed = response as StudentLoginSuccess;

    return (
        parsed &&
        typeof parsed.student_id === "number" &&
        typeof parsed.class_id === "number"

    );
}

export function isStudentLoginError(response: unknown): response is StudentLoginFailure {
    const parsed = response as StudentLoginFailure;
    return (
        parsed &&
        typeof parsed && typeof parsed.detail === "string"
    );
}
