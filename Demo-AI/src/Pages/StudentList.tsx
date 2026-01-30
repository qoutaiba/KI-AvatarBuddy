import React, { useState } from 'react'
import {
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper
} from '@mui/material'
import type { User } from '../classes/User';


interface IStudentListProps {
  className: string;
  students: User[];
  addStudent: (student: User) => void;
}

const StudentList: React.FC<IStudentListProps> = ({ className, students, addStudent }) => {
  const [Students, setStudents] = useState<User[]>(students);
  const [newName, setNewName] = useState<string>('') // Name aus Input


  const handleAddStudent = () => {
    if (!newName.trim()) return // leeren Input ignorieren

    const newStudent: User = {
      id: students.length > 0 ? students[students.length - 1].id + 1 : 1,
      username: newName.trim(),
      currentClass: className,
      isTeacher: false
    }
    addStudent(newStudent);
    setStudents([...students, newStudent])
    console.log(`Neuer Schüler hinzugefügt: ${newStudent.username} in Klasse ${className}`);
    setNewName('') // Input zurücksetzen
  }

  return (
    <Box sx={{ width: "100vw", height: "100vh", overflowY: "auto" }}>
      <Box sx={{ mx: 4, mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Klasse {className}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="subtitle1">
          Schüler:
        </Typography>

        <TextField
          label="Name des Schülers"
          variant="outlined"
          size="small"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAddStudent}
        >
          Hinzufügen
        </Button>
        </Box>

    


        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.username}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Box>
  )
}

export default StudentList