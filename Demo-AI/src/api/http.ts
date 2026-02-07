// src/api/http.ts
export class ApiError extends Error {
    status: number;
    detail?: string;
    body?: unknown;

    constructor(message: string, status: number, detail?: string, body?: unknown) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
        this.body = body;
    }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

function joinUrl(base: string, path: string) {
    if (!base) return path; // erlaubt Proxy/relative Calls
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
}

async function parseBody(res: Response) {
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
}

export async function apiRequest<T>(
    path: string,
    init: RequestInit & { json?: unknown } = {}
): Promise<T> {
    const url = joinUrl(BASE_URL, path);

    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");

    let body = init.body;
    if (init.json !== undefined) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(init.json);
    }

    const res = await fetch(url, { ...init, headers, body });

    const parsed = await parseBody(res);

    if (!res.ok) {
        const detail =
            parsed && typeof parsed === "object" && "detail" in (parsed as any)
                ? String((parsed as any).detail)
                : undefined;

        throw new ApiError(
            detail ?? `Request failed (${res.status})`,
            res.status,
            detail,
            parsed
        );
    }

    return parsed as T;
}

// kleine Convenience-API
export const api = {
    get: <T>(path: string, init?: RequestInit) =>
        apiRequest<T>(path, { ...(init ?? {}), method: "GET" }),
    post: <T>(path: string, json?: unknown, init?: RequestInit) =>
        apiRequest<T>(path, { ...(init ?? {}), method: "POST", json }),
    put: <T>(path: string, json?: unknown, init?: RequestInit) =>
        apiRequest<T>(path, { ...(init ?? {}), method: "PUT", json }),
    del: <T>(path: string, init?: RequestInit) =>
        apiRequest<T>(path, { ...(init ?? {}), method: "DELETE" }),
};
