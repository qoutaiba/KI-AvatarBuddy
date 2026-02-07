// src/hooks/useApiCall.ts
import { useCallback, useState } from "react";
import { ApiError } from "../api/http";

export function toErrorMessage(err: unknown) {
    if (err instanceof ApiError) return err.detail ?? err.message;
    if (err instanceof Error) return err.message;
    return "Unbekannter Fehler";
}

export function useApiCall() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const call = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await fn();
        } catch (e) {
            setError(toErrorMessage(e));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, setError, call };
}