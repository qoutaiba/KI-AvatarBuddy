import React from 'react';
import {ChatBoard} from '../components/Chatboard/Chatboard';
import InputBox from '../components/InputBox/InputBox';
import type {IChatMessage} from '../Interfaces/IChatMessage';
import {StatusBar} from '../components/Status/StatusBar';
import './Classroom.css'
import Character from "../avatar/components/Character/Character.tsx";
import type {Subject} from "../classes/Subject.ts";

interface ClassroomProps {
    username: string,
    messages: IChatMessage[],
    onSend: (text: IChatMessage) => void,
    fetchFinalResponse?: () => Promise<void>
    subject: Subject;
}


const Classroom: React.FC<ClassroomProps> = ({username, messages, onSend, fetchFinalResponse, subject}) => {
    // const { subject } = useParams<{ subject: string }>()
    return (
        <div className="classroom">
            <div className="content">
                <div className='left'>
                    <Character/>
                    {<StatusBar username={username} subject={subject.name}/>}
                </div>
                <div className="right">
                    <ChatBoard messages={messages}/>
                    <InputBox onSend={onSend}/>
                </div>
                <button onClick={fetchFinalResponse}>Fetch final response</button>
            </div>
        </div>
    );
};

export default Classroom;
