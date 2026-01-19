import React from 'react';
import type { IChatMessage } from '../../Interfaces/IChatMessage';
import './Messages.css';

interface MessageProps {
  message: IChatMessage;
}


  

const Message: React.FC<MessageProps> = ({ message }) => {
  
  const displayName =
    message.sender === 'user'
    ? message.username ?? 'User'
    : 'AI Buddy'
    
const timeString = message.timestamp.toLocaleTimeString('de-DE', {
  hour: '2-digit',
  minute: '2-digit',
});


  return (
    
    <div className={message.sender === 'user' ? 'user-message' : 'ai-message'}>
       {`${displayName}: ${message.text}`  }
       <div className='timestamp'>
       {timeString}
      </div>
    </div>
  );
};

export default Message;
