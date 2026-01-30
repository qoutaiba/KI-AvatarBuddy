import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../NavBar/NavBar'

interface AppLayoutProps {
  username: string
  onLogout: () => void
  teacher: boolean
}

const AppLayout: React.FC<AppLayoutProps> = ({ username, onLogout, teacher }) => {
  return (
    <>
        <NavBar username={username} onLogout={onLogout} teacher={teacher} />
        <Outlet />
    </>
  );
};

export default AppLayout;
