import React, { useRef, useEffect } from 'react';
import Message from '../ChatHistory/Messages';
import type { IChatMessage } from '../../Interfaces/IChatMessage';
import './ChatBoard.css';

interface ChatBoardProps {
  messages: IChatMessage[];
}

export const ChatBoard: React.FC<ChatBoardProps> = ({ messages }) => {
  const boardRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (boardRef.current) {
      boardRef.current.scrollTop = boardRef.current.scrollHeight;
    }

  }, [messages]);

  return (
    <div className="chat-board" ref={boardRef}>
      {messages.map((msg, i) => (
        <Message key={i} message={msg} />
      ))}
    </div>
  );
};

