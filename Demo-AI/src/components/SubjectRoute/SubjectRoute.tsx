import React from 'react'
import Classroom from '../../Pages/Classroom'
import type {IChatMessage} from '../../Interfaces/IChatMessage'
import {Subject} from '../../classes/Subject'
import {Navigate, useLocation} from "react-router-dom";

interface SubjectRouteProps {
    subjects: Subject[] | null;
    username: string;
    messages: IChatMessage[];
    onSend: (msg: IChatMessage) => void;
    fetchFinalResponse?: () => Promise<void>;
}

const SubjectRoute: React.FC<SubjectRouteProps> = ({username, messages, onSend, fetchFinalResponse}) => {
    type LocationState = {
        subject?: Subject;
    };

    const location = useLocation();
    const state = location.state as LocationState | null;
    const selectedSubject = state?.subject;

    if (!selectedSubject) {
        return <Navigate to="/" replace/>;
    }

    return <Classroom username={username} subject={selectedSubject} messages={messages} onSend={onSend}
                      fetchFinalResponse={fetchFinalResponse}/>;
}

export default SubjectRoute