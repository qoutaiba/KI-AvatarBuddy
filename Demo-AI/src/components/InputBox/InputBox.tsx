import React, { useState } from 'react';
import './InputBox.css';
import VoiceButton from '../VoiceButton/VoiceButton';
import type { IChatMessage } from '../../Interfaces/IChatMessage';

interface InputBoxProps {
  onSend: (message: IChatMessage) => void;
}

const InputBox: React.FC<InputBoxProps> = ({ onSend }) => {
  const [input, setInput] = useState<string>('');

  const handleSend = () => {
  const newMsg: IChatMessage = {
    id: Date.now().toString(),
    sender: 'user',
    text: input,
    timestamp: new Date()
  };

  onSend(newMsg);
  setInput('');
};

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Vlt direkt senden / handleSend auslösen?
  const handleTranscript = (text:string) =>{
    setInput(text)
  }

    function handleRepeateRecording() {
        setInput("")
    }

    return (
      <div className="input-box">
        <input
            type="text"
            placeholder="Schreibe eine Nachricht..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
        />
        <VoiceButton onTranscript={handleTranscript}
        />

        <button
            onClick={handleRepeateRecording}>
            nochmal
        </button>

        <button onClick={handleSend}>Senden</button>

      </div>
  );
};

export default InputBox;
