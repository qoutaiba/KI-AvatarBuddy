import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import StudentList from '../../Pages/StudentList'
import type { User } from '../../classes/User'
import type { SchoolClass } from '../../classes/SchoolClass';

interface ClassRouteProps {
  addStudent: (student: User) => void;
  
}

const ClassRoute: React.FC<ClassRouteProps> = ({  addStudent }) => {
  const { classId, className } = useParams<{ classId: string; className: string }>();

  
  if (!classId || isNaN(Number(classId))) {
    return <Navigate to="/404" replace />
  }

  if (!className) {
    return <Navigate to="/404" replace />;
  }

  const numericClassId = Number(classId);
  
 

  return (
    <StudentList
      classId={numericClassId}
      className={decodeURIComponent(className)}
      addStudent={addStudent}
    />
  );
}

export default ClassRoute
