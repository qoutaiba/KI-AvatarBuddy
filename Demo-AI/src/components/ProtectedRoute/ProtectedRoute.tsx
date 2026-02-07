import React from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  condition: boolean
  children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ condition, children }) => {
  if (!condition) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute