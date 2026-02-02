import React from 'react'
import './StatusBar.css'

interface StatusBarProps {
    username: string
    subject: string | undefined
}

export const StatusBar: React.FC<StatusBarProps> = ({username, subject}) => {
    return (
        <div className="status-bar">
            <span className="status-text">Du bist: <strong>{username}</strong></span>
            <br/>
            <span
                className="status-text">Fach: <strong>{(subject?.charAt(0)?.toUpperCase() ?? "") + (subject?.slice(1) ?? "")}</strong></span>
        </div>
    );
};


