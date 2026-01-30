import React from 'react'
import { Navigate } from 'react-router-dom'

import { useParams } from 'react-router-dom'
import StudentList from '../../Pages/StudentList'
import { SchoolClass } from '../../classes/SchoolClass'
import type { User } from '../../classes/User'

interface ClassRouteProps {
  schoolClasses: SchoolClass[] | null;
  users: User[];
  addStudent: (student: User) => void;
}

const ClassRoute: React.FC<ClassRouteProps> = ({ schoolClasses, users, addStudent }) => {
  const { schoolClass } = useParams<{ schoolClass: string }>();

  if (!schoolClass || schoolClasses === null || !schoolClasses.some(s => s.name.toLowerCase() === schoolClass.toLowerCase())) return <Navigate to="/404" replace />;

  return <StudentList className={schoolClass} students={users.filter(user => user.currentClass?.toLowerCase() === schoolClass.toLowerCase())} addStudent={addStudent} />;
}

export default ClassRoute