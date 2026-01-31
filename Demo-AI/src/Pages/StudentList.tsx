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
import { generatePassword } from '../components/HelperFunctions/GeneratePassword';

interface IStudentListProps {
  className: string;
  students: User[];
  addStudent: (student: User) => void;
}

const StudentList: React.FC<IStudentListProps> = ({ className, students, addStudent }) => {
  const [Students, setStudents] = useState<User[]>(students);
  const [newName, setNewName] = useState<string>('') // Name aus Input
  const [newUsername, setNewUsername] = useState<string>('') // Username aus Input


  type CreateStudentResponse = {
    id: number;
    name: string;
    username: string;
    class_id: number;
    password: string;
  }

  function isCreateStudentResponse(input: unknown): input is CreateStudentResponse {
    const parsed = input as CreateStudentResponse;

    return (
      parsed &&
      typeof parsed.id === "number" &&
      typeof parsed.name === "string" &&
      typeof parsed.username === "string" &&
      typeof parsed.class_id === "number"
    );
  }

  const handleAddStudent = async () => {
  if (!newName.trim() || !newUsername.trim()) return;

  const password = generatePassword();

  try {
    const response = await fetch("http://localhost:8000/api/classes/1/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        class_id: 1,
        username: newUsername.trim(),
        password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const json = await response.json();

    if (!isCreateStudentResponse(json)) {
      throw new Error(`Unexpected response: ${JSON.stringify(json)}`);
    }

    // ✅ Backend bestätigt → jetzt UI updaten
    const newStudent: User = {
      class_id: json.class_id,
      name: json.name,
      username: json.username,
      password,
      currentClass: className,
    };

    addStudent(newStudent);
    setStudents(prev => [...prev, newStudent]);

    setNewName("");
    setNewUsername("");

    console.log("Schüler erfolgreich erstellt:", json);

  } catch (err) {
    console.error("Schüler konnte nicht erstellt werden:", err);
    alert("Schüler konnte nicht erstellt werden ");
  }
};


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

        <TextField
          label="Username"
          variant="outlined"
          size="small"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
        
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
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Password</strong></TableCell>

              </TableRow>
            </TableHead>

            <TableBody>
              {Students.map((student) => (
                <TableRow key={student.class_id}>
                  <TableCell>{student.class_id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.password}</TableCell>
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