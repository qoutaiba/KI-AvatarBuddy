import React from 'react';
import { useParams } from 'react-router-dom';
import {ChatBoard} from '../components/Chatboard/Chatboard';
import InputBox from '../components/InputBox/InputBox';
import type {IChatMessage} from '../Interfaces/IChatMessage';
import {StatusBar} from '../components/Status/StatusBar';
import {MediaPanel} from '../components/MediaPanel/MediaPanel';
import {MediaItem} from '../components/MediaItem/MediaItem';
import {MediaType} from '../enums/MediaType';
import './Classroom.css'
import Character from "../avatar/components/Character/Character.tsx";

interface ClassroomProps {
    username: string,
    messages: IChatMessage[],
    onSend: (text: IChatMessage) => void,
    fetchFinalResponse?: () => Promise<void>
}

const dummyMedia1 = new MediaItem(
    '1',
    MediaType.IMAGE,
    'Photosynthese',
    'https://tse1.explicit.bing.net/th/id/OIP.NO4OZ6ocvEJ-jbWsXESazgHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
    'Übersicht zur Photosynthese'
)
const dummyMedia2 = new MediaItem(
    '2',
    MediaType.VIDEO,
    'Capibara',
    'https://www.youtube.com/watch?v=8Pj-YEQbojk',
    'Capibara Song'
)
const dummyMedia = [dummyMedia1, dummyMedia2]

const Classroom: React.FC<ClassroomProps> = ({username, messages, onSend, fetchFinalResponse}) => {
    const { subject } = useParams<{ subject: string }>()

    return (
        <div className="classroom">
            <div className="content">
                <div className='left'>
                    <Character/>    
                    <StatusBar username={username} subject={subject}/>
                </div>

                <div className='middle'>
                    <MediaPanel media={dummyMedia}/>
                </div>


                <div className="right">
                    <ChatBoard messages={messages}/>
                    <InputBox onSend={onSend}/>
                </div>
                <button onClick={() => {
                    (window as {
                        avatarSpreche: ((input: string) => void)
                    }).avatarSpreche("Hello ich mache hiermit eine Probe ")
                }}> hi
                </button>
                <button onClick={fetchFinalResponse}>Fetch final response</button>
            </div>
        </div>
    );
};

export default Classroom;
