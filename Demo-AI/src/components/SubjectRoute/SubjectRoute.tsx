import React from 'react'
import { Navigate } from 'react-router-dom'

import { useParams } from 'react-router-dom'
import Classroom from '../../Pages/Classroom'
import type { IChatMessage } from '../../Interfaces/IChatMessage'
import { Subject } from '../../classes/Subject'

interface SubjectRouteProps {
  subjects: Subject[] | null;
  username: string;
  messages: IChatMessage[];
  onSend: (msg: IChatMessage) => void;
  fetchFinalResponse?: () => Promise<void>;
}

const SubjectRoute: React.FC<SubjectRouteProps> = ({ subjects, username, messages, onSend, fetchFinalResponse }) => {
  const { subject } = useParams<{ subject: string }>();

  if (!subject || subjects === null || !subjects.some(s => s.name.toLowerCase() === subject.toLowerCase())) return <Navigate to="/404" replace />;

  return <Classroom username={username} messages={messages} onSend={onSend} fetchFinalResponse={fetchFinalResponse} />;
}

export default SubjectRoute