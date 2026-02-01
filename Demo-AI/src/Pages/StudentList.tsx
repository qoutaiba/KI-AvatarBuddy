import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import type { User } from '../classes/User';
import { generatePassword } from '../components/HelperFunctions/GeneratePassword';

interface IStudentListProps {
  classId: number;
  className: string;
  addStudent: (student: User) => void;
}

const StudentList: React.FC<IStudentListProps> = ({ classId, className, addStudent }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  type StudentFromBackend = {
    id: number;
    name: string;
    username: string;
    class_id: number;
    password?: string;
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/classes/${classId}/students?teacher_id=3`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error("Unexpected students response:", data);
        return;
      }

      setStudents(
        data.map((s: StudentFromBackend) => ({
          ...s,
          password: s.password || '',
          currentClass: className,
        }))
      );
    } catch (err) {
      console.error("Fehler beim Laden der Schüler:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const handleAddStudent = async () => {
    if (!newName.trim() || !newUsername.trim()) return;

    const password = generatePassword();

    try {
      const response = await fetch(`http://localhost:8000/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          username: newUsername.trim(),
          class_id: classId,
          password: password,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json: StudentFromBackend = await response.json();

      const newStudent: User = {
        id: json.id,
        name: json.name,
        username: json.username,
        class_id: json.class_id,
        password,
        currentClass: className,
      };

      setStudents(prev => [...prev, newStudent]);
      addStudent(newStudent);

      setNewName('');
      setNewUsername('');

      console.log("Schüler erfolgreich erstellt:", json);
    } catch (err) {
      console.error("Schüler konnte nicht erstellt werden:", err);
      alert("Schüler konnte nicht erstellt werden");
    }
  };

  const handleDeleteStudent = async () => { //Todo: instead of use next id, use the deleted one.
  if (deleteId === null) return;

  try {
    const response = await fetch(
      `http://localhost:8000/api/user/student/${deleteId}?teacher_id=3`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    setStudents(prev => prev.filter(s => s.id !== deleteId));
    setDeleteId(null);

    console.log("Schüler erfolgreich gelöscht");
  } catch (err) {
    console.error("Fehler beim Löschen des Schülers:", err);
    alert("Schüler konnte nicht gelöscht werden");
  }
};


  return (
    <Box sx={{ width: "100vw", height: "100vh", overflowY: "auto" }}>
      <Box sx={{ mx: 4, mt: 4 }}>
        <Typography variant="h3" gutterBottom>{className}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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
          <Button variant="contained" color="primary" onClick={handleAddStudent}>
            Hinzufügen
          </Button>
          <TextField
                      label="ID zum Löschen"
                      variant="outlined"
                      size="small"
                      value={deleteId !== null ? deleteId : ''}
                      onChange={(e) => setDeleteId(Number(e.target.value))}
                    />
          <Button variant="contained" color="secondary" onClick={handleDeleteStudent}>
            Löschen
          </Button>
        </Box>
       
        <TableContainer component={Paper} sx={{
    maxHeight: '60vh',   // oder z.B. 400
    overflowY: 'auto',
  }}>
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
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>
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
  );
};

export default StudentList;
