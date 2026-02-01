import React from 'react'
import { Typography, Box, Grid, Button } from '@mui/material'

import ClassCard from '../components/ClassCard/ClassCard';
import type { SchoolClass } from '../classes/SchoolClass';
import {  useEffect } from 'react';
import { useState } from 'react';



 export const Administration: React.FC  = () => {
    const [loadedClasses, setLoadedClasses] = useState<SchoolClass[]>([]);

    const handleOnClick = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/classes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Class 7B",
        teacher_id: 3,
        grade_level: "7",
        subject: "Biologie",
      }),
      
    });
    
    const classResponse = await fetch("http://localhost:8000/api/classes");
      if (!classResponse.ok) {
        throw new Error(`HTTP ${classResponse.status}`);
      }

      const ClassData: SchoolClass[] = await classResponse.json();
      setLoadedClasses(ClassData);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Error creating class:", error);
  }};

 const handleRegisterTeacher = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/teachers/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Justin",
        email: "demqqo@example.com",
        password: "tesqqt123",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Teacher registered successfully:", data);
  } catch (error) {
    console.error("Error registering teacher:", error);
  }
};
    
useEffect(() => {
  const fetchClasses = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/classes");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: SchoolClass[] = await response.json();
      setLoadedClasses(data);
    } catch (err) {
      console.error("Fehler beim Laden der Klassen:", err);
    }
  };

  fetchClasses();
}, []);

  return (
    <Box sx={{width: "100vw", height: "100vh", overflowY: "auto"}}>
        <Box sx={{marginLeft: '32px', marginRight: '32px', marginTop: '32px'}}>
            <Typography variant='h3' component='h1' gutterBottom sx={{ ml: 0.5, overflow: "hidden", textOverflow: "ellipsis" }}>Verwaltung</Typography>
            <Typography variant='subtitle1' sx={{ ml: 0.5 }}>Wählen Sie eine Klasse, um zu beginnen.</Typography>
        <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleOnClick}
                >
                  Klasse Hinzufügen
        </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleRegisterTeacher}
                >
                  Lehrer Hinzufügen
        </Button>
        </Box>
         
            <Grid container spacing={4} justifyContent={'flex-start'} alignItems={'flex-start'} sx={{ margin: '32px' }}>
            {loadedClasses.map((schoolClass) => (
                <Grid key={schoolClass.id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2.4 }}>

                <ClassCard id={schoolClass.id} name={schoolClass.name} subject={schoolClass.subject} />
                </Grid>
            ))}
            </Grid>

    </Box>
  );
};



