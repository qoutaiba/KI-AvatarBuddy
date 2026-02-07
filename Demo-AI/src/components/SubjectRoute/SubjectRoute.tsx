import React, { useMemo } from "react";
import Classroom from "../../Pages/Classroom";
import type { IChatMessage } from "../../Interfaces/IChatMessage";
import { Subject } from "../../classes/Subject";
import { Navigate, useParams } from "react-router-dom";

interface SubjectRouteProps {
    subjects: Subject[] | null;
    username: string;
    messages: IChatMessage[];
    onSend: (msg: IChatMessage) => void;
    fetchFinalResponse?: () => Promise<void>;
}

const normalize = (s: string) => decodeURIComponent(s).trim().toLowerCase();

const SubjectRoute: React.FC<SubjectRouteProps> = ({
                                                       subjects,
                                                       username,
                                                       messages,
                                                       onSend,
                                                       fetchFinalResponse,
                                                   }) => {
    const { subject } = useParams<{ subject: string }>();

    const selectedSubject = useMemo(() => {
        if (!subject || !subjects?.length) return null;

        const wanted = normalize(subject);

        return (
            subjects.find((s) => normalize(s.name) === wanted) ??
            null
        );
    }, [subject, subjects]);

    // Wenn subject ungültig ist oder subjects noch nicht da sind → zurück
    // (Optional: "Lade..." anzeigen statt Redirect)
    if (!selectedSubject) {
        return <Navigate to="/" replace />;
    }

    return (
        <Classroom
            username={username}
            subject={selectedSubject}
            messages={messages}
            onSend={onSend}
            fetchFinalResponse={fetchFinalResponse}
        />
    );
};

export default SubjectRoute;
