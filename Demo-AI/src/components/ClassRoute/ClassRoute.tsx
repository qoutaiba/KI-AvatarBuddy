import React from 'react'
import StudentList from '../../Pages/StudentList'
import type {User} from '../../classes/User'

interface ClassRouteProps {
    addStudent: (student: User) => void;

}

const ClassRoute: React.FC<ClassRouteProps> = ({addStudent}) => {
    // const {classId, className} = useParams<{ classId: string; className: string }>();


    // if (!classId || isNaN(Number(classId))) {
    //   return <Navigate to="/404" replace />
    // }
    //
    // if (!className) {
    //   return <Navigate to="/404" replace />;
    // }

    // const numericClassId = Number(classId);


    return (
        <StudentList
            classId={2}
            className={decodeURIComponent("className")}
            addStudent={addStudent}
        />
    );
}

export default ClassRoute
