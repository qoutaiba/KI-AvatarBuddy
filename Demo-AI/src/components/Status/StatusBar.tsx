import React from 'react';
import './StatusBar.css';

interface StatusBarProps {
  username: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ username }) => {
  return (
    <div className="status-bar">
      <span className="status-text">Du bist: <strong>{username}</strong></span>
    </div>
  );
};

export default StatusBar;
