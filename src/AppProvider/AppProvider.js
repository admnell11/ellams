import React, { createContext, useState, useEffect } from 'react';

// Create context
export const AppContext = createContext();

// API Service (Simulated)
const apiService = {
  _authToken: null,
  _currentUserId: null,

  simulateDelay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // --- Data (persisted in localStorage) ---
  data: {
    events: [],
    assignments: [],
    alumni: [],
    generatedDocs: [],
    courses: [],
    faculty: [],
    rooms: [],
    studentGroups: [],
    routineEntries: [],
    curriculums: [],
    programCourses: [],
    courseOfferings: [],
    attendanceRecords: [], // Added for attendance
    students: [], // Added for student profiles
  },

  // Initialize data from localStorage or use defaults
  initializeData: function() {
    for (const key in this.data) {
      const storedData = localStorage.getItem(`ell_ams_${key}`);
      if (storedData) {
        this.data[key] = JSON.parse(storedData);
      } else {
        localStorage.setItem(`ell_ams_${key}`, JSON.stringify(this.data[key]));
      }
    }
    this._authToken = localStorage.getItem('ell_ams_authToken');
    this._currentUserId = localStorage.getItem('ell_ams_currentUserId');
  },

  // Persist data to localStorage
  persistData: function(key) {
    if (this.data.hasOwnProperty(key)) {
      localStorage.setItem(`ell_ams_${key}`, JSON.stringify(this.data[key]));
    }
  },

  // --- API Categories ---
  auth: {
    login: async function(credentials) {
      await apiService.simulateDelay(500);
      // Simulate login
      if (credentials.username === 'ell_admin' && credentials.password === 'ellams123') {
        const userId = 'super_admin_001'; // Using a more descriptive ID for the super admin
        const token = 'super-secret-auth-token';
        apiService._authToken = token;
        apiService._currentUserId = userId;
        localStorage.setItem('ell_ams_authToken', token);
        localStorage.setItem('ell_ams_currentUserId', userId);
        // Simulate fetching/creating a super admin faculty member upon login
        let facultyMember = apiService.data.faculty.find(f => f.id === userId);
        if (!facultyMember) {
            facultyMember = { id: userId, name: 'Super Admin', role: 'SuperAdmin', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            apiService.data.faculty.push(facultyMember);
            apiService.persistData('faculty');
        }
        return { success: true, user: facultyMember, token };
      }
      return { success: false, message: 'Invalid credentials' };
    },
    logout: async function() {
      await apiService.simulateDelay(200);
      apiService._authToken = null;
      apiService._currentUserId = null;
      localStorage.removeItem('ell_ams_authToken');
      localStorage.removeItem('ell_ams_currentUserId');
      return { success: true };
    },
    checkAuthStatus: async function() {
      await apiService.simulateDelay(100);
      if (apiService._authToken && apiService._currentUserId) {
        const user = apiService.data.faculty.find(f => f.id === apiService._currentUserId) || { id: apiService._currentUserId, name: 'User', role: 'Faculty' };
        return { isAuthenticated: true, user };
      }
      return { isAuthenticated: false };
    }
  },
  calendar: {
    fetchEvents: async function() {
      await apiService.simulateDelay(300);
      return { success: true, data: [...apiService.data.events] };
    },
    addEvent: async function(eventData) {
      await apiService.simulateDelay(200);
      const newEvent = { id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, ...eventData };
      apiService.data.events.push(newEvent);
      apiService.persistData('events');
      return { success: true, data: newEvent };
    },
    updateEvent: async function(eventId, updatedData) {
      await apiService.simulateDelay(200);
      const eventIndex = apiService.data.events.findIndex(e => e.id === eventId);
      if (eventIndex > -1) {
        apiService.data.events[eventIndex] = { ...apiService.data.events[eventIndex], ...updatedData };
        apiService.persistData('events');
        return { success: true, data: apiService.data.events[eventIndex] };
      }
      return { success: false, message: 'Event not found' };
    },
    deleteEvent: async function(eventId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.events.length;
      apiService.data.events = apiService.data.events.filter(e => e.id !== eventId);
      if (apiService.data.events.length < initialLength) {
        apiService.persistData('events');
        return { success: true };
      }
      return { success: false, message: 'Event not found or already deleted' };
    }
  },
  routine: {
    fetchRoutineEntries: async function() {
      await apiService.simulateDelay(300);
      return { success: true, data: [...apiService.data.routineEntries] };
    },
    addRoutineEntry: async function(entryData) {
      await apiService.simulateDelay(200);
      // Basic clash detection (can be expanded)
      const clash = apiService.data.routineEntries.find(
        e => e.day === entryData.day &&
             e.timeSlot === entryData.timeSlot &&
             (e.facultyId === entryData.facultyId || e.roomId === entryData.roomId || e.studentGroupId === entryData.studentGroupId)
      );
      if (clash) {
        return { success: false, message: 'Clash detected with an existing entry.' };
      }
      const newEntry = { id: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, ...entryData };
      apiService.data.routineEntries.push(newEntry);
      apiService.persistData('routineEntries');
      return { success: true, data: newEntry };
    },
    updateRoutineEntry: async function(entryId, updatedData) {
      await apiService.simulateDelay(200);
      const entryIndex = apiService.data.routineEntries.findIndex(e => e.id === entryId);
      if (entryIndex > -1) {
        // Basic clash detection for update (excluding self)
        const clash = apiService.data.routineEntries.find(
          e => e.id !== entryId &&
               e.day === (updatedData.day || apiService.data.routineEntries[entryIndex].day) &&
               e.timeSlot === (updatedData.timeSlot || apiService.data.routineEntries[entryIndex].timeSlot) &&
               ((updatedData.facultyId || apiService.data.routineEntries[entryIndex].facultyId) === e.facultyId ||
                (updatedData.roomId || apiService.data.routineEntries[entryIndex].roomId) === e.roomId ||
                (updatedData.studentGroupId || apiService.data.routineEntries[entryIndex].studentGroupId) === e.studentGroupId)
        );
        if (clash) {
          return { success: false, message: 'Update creates a clash with an existing entry.' };
        }
        apiService.data.routineEntries[entryIndex] = { ...apiService.data.routineEntries[entryIndex], ...updatedData };
        apiService.persistData('routineEntries');
        return { success: true, data: apiService.data.routineEntries[entryIndex] };
      }
      return { success: false, message: 'Routine entry not found' };
    },
    deleteRoutineEntry: async function(entryId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.routineEntries.length;
      apiService.data.routineEntries = apiService.data.routineEntries.filter(e => e.id !== entryId);
      if (apiService.data.routineEntries.length < initialLength) {
        apiService.persistData('routineEntries');
        return { success: true };
      }
      return { success: false, message: 'Routine entry not found or already deleted' };
    },
    // Example time slots, can be made configurable
    getTimeSlots: async function() {
      await apiService.simulateDelay(50);
      return { success: true, data: [
        "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM"
      ]};
    }
  },
  attendance: {
    fetchStudentsAndCourses: async function() {
      // This would typically fetch students enrolled in courses taught by the logged-in faculty
      // For simulation, let's return all students and all courses
      await apiService.simulateDelay(400);
      // Assume students have an 'id' and 'name'
      // Assume courses have 'id', 'name', and 'facultyId'
      // This needs to be more sophisticated in a real app, e.g., linking students to courseOfferings
      const students = apiService.data.studentGroups.reduce((acc, group) => {
        // Assuming studentGroups have a 'students' array with student objects
        // This is a placeholder, actual student data structure might differ
        group.students?.forEach(s => acc.push({id: s.id, name: s.name, groupId: group.id}));
        return acc;
      }, []);
      
      // For simplicity, returning all courses. In reality, it should be courses assigned to the faculty or relevant to selection.
      const courses = [...apiService.data.courses];
      return { success: true, data: { students, courses } };
    },
    fetchRecords: async function(courseId, date) {
      // Date should be in a consistent format, e.g., YYYY-MM-DD
      await apiService.simulateDelay(250);
      const records = apiService.data.attendanceRecords.filter(
        r => r.courseId === courseId && r.date === date
      );
      return { success: true, data: records };
    },
    saveAttendance: async function(attendanceData) {
      // attendanceData expected to be an array of objects:
      // { studentId, courseId, date, status: 'Present' | 'Absent' }
      await apiService.simulateDelay(300);
      if (!Array.isArray(attendanceData)) {
        return { success: false, message: "Invalid data format." };
      }
      const newRecords = [];
      attendanceData.forEach(record => {
        const existingRecordIndex = apiService.data.attendanceRecords.findIndex(
          r => r.studentId === record.studentId && r.courseId === record.courseId && r.date === record.date
        );
        const newRecord = { id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, ...record };
        if (existingRecordIndex > -1) {
          apiService.data.attendanceRecords[existingRecordIndex] = { ...apiService.data.attendanceRecords[existingRecordIndex], ...record, updatedAt: new Date().toISOString() };
           newRecords.push(apiService.data.attendanceRecords[existingRecordIndex]);
        } else {
          apiService.data.attendanceRecords.push({...newRecord, createdAt: new Date().toISOString()});
          newRecords.push(newRecord);
        }
      });
      apiService.persistData('attendanceRecords');
      return { success: true, data: newRecords, message: 'Attendance saved successfully.' };
    }
  },
  assignments: {
    fetchAssignments: async function() {
      await apiService.simulateDelay(300);
      // In a real app, this might filter by facultyId or courseId
      return { success: true, data: [...apiService.data.assignments] };
    },
    addAssignment: async function(assignmentData) {
      await apiService.simulateDelay(200);
      const newAssignment = {
        id: `asg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...assignmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      apiService.data.assignments.push(newAssignment);
      apiService.persistData('assignments');
      return { success: true, data: newAssignment };
    },
    updateAssignment: async function(assignmentId, updatedData) {
      await apiService.simulateDelay(200);
      const assignmentIndex = apiService.data.assignments.findIndex(a => a.id === assignmentId);
      if (assignmentIndex > -1) {
        apiService.data.assignments[assignmentIndex] = {
          ...apiService.data.assignments[assignmentIndex],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        apiService.persistData('assignments');
        return { success: true, data: apiService.data.assignments[assignmentIndex] };
      }
      return { success: false, message: 'Assignment not found' };
    },
    deleteAssignment: async function(assignmentId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.assignments.length;
      apiService.data.assignments = apiService.data.assignments.filter(a => a.id !== assignmentId);
      if (apiService.data.assignments.length < initialLength) {
        apiService.persistData('assignments');
        return { success: true };
      }
      return { success: false, message: 'Assignment not found or already deleted' };
    }
  },
  profiles: {
    fetchTeacher: async function(teacherId) {
      await apiService.simulateDelay(200);
      // Assuming apiService._currentUserId is the logged-in teacher's ID for their own profile
      // or an admin can fetch any teacher.
      const idToFetch = teacherId || apiService._currentUserId;
      const teacher = apiService.data.faculty.find(f => f.id === idToFetch);
      if (teacher) {
        // In a real app, you might augment this with related data like courses taught, etc.
        return { success: true, data: { ...teacher } };
      }
      return { success: false, message: 'Teacher not found' };
    },
    fetchStudent: async function(studentId) {
      await apiService.simulateDelay(200);
      const student = apiService.data.students.find(s => s.id === studentId);
      if (student) {
        // Augment with enrolled courses, etc.
        // For now, just basic student data
        return { success: true, data: { ...student } };
      }
      return { success: false, message: 'Student not found' };
    },
    // updateStudent is for admin/faculty, student might have a separate limited update
    updateStudent: async function(studentId, updatedData) {
      await apiService.simulateDelay(250);
      const studentIndex = apiService.data.students.findIndex(s => s.id === studentId);
      if (studentIndex > -1) {
        apiService.data.students[studentIndex] = {
          ...apiService.data.students[studentIndex],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        apiService.persistData('students');
        // Also update in studentGroups if they are denormalized there
        apiService.data.studentGroups.forEach(group => {
            const sIdx = group.students?.findIndex(s => s.id === studentId);
            if (sIdx > -1) {
                group.students[sIdx] = {...group.students[sIdx], ...updatedData};
            }
        });
        apiService.persistData('studentGroups');
        return { success: true, data: apiService.data.students[studentIndex] };
      }
      return { success: false, message: 'Student not found' };
    },
    addStudent: async function(studentData) {
      await apiService.simulateDelay(250);
      // Basic check for existing student by some unique identifier if necessary (e.g., email or studentIdNumber)
      // For now, just adds.
      const newStudent = {
        id: `stu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...studentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      apiService.data.students.push(newStudent);
      apiService.persistData('students');
      // Optionally, add to a default studentGroup or handle group assignment separately
      return { success: true, data: newStudent };
    },
    deleteStudent: async function(studentId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.students.length;
      apiService.data.students = apiService.data.students.filter(s => s.id !== studentId);
      if (apiService.data.students.length < initialLength) {
        apiService.persistData('students');
        // Also remove from studentGroups
        apiService.data.studentGroups.forEach(group => {
            group.students = group.students?.filter(s => s.id !== studentId);
        });
        apiService.persistData('studentGroups');
        // Also remove related attendance, assignments submissions etc. (cascade deletion logic)
        // For now, just basic deletion.
        return { success: true };
      }
      return { success: false, message: 'Student not found or already deleted' };
    }
  },
  alumni: {
    fetchAlumni: async function() {
      await apiService.simulateDelay(300);
      return { success: true, data: [...apiService.data.alumni] };
    },
    addAlumni: async function(alumniData) {
      await apiService.simulateDelay(200);
      const newAlumnus = {
        id: `alm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...alumniData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      apiService.data.alumni.push(newAlumnus);
      apiService.persistData('alumni');
      return { success: true, data: newAlumnus };
    },
    updateAlumni: async function(alumniId, updatedData) {
      await apiService.simulateDelay(200);
      const alumniIndex = apiService.data.alumni.findIndex(a => a.id === alumniId);
      if (alumniIndex > -1) {
        apiService.data.alumni[alumniIndex] = {
          ...apiService.data.alumni[alumniIndex],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        apiService.persistData('alumni');
        return { success: true, data: apiService.data.alumni[alumniIndex] };
      }
      return { success: false, message: 'Alumni record not found' };
    },
    deleteAlumni: async function(alumniId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.alumni.length;
      apiService.data.alumni = apiService.data.alumni.filter(a => a.id !== alumniId);
      if (apiService.data.alumni.length < initialLength) {
        apiService.persistData('alumni');
        return { success: true };
      }
      return { success: false, message: 'Alumni record not found or already deleted' };
    }
  },
  documents: {
    fetchGenerated: async function() {
      await apiService.simulateDelay(200);
      return { success: true, data: [...apiService.data.generatedDocs] };
    },
    addGenerated: async function(docData) {
      // docData might include name, type, content/reference, creationDate
      await apiService.simulateDelay(150);
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...docData,
        createdAt: new Date().toISOString()
      };
      apiService.data.generatedDocs.push(newDoc);
      apiService.persistData('generatedDocs');
      return { success: true, data: newDoc };
    },
    deleteGenerated: async function(docId) {
      await apiService.simulateDelay(150);
      const initialLength = apiService.data.generatedDocs.length;
      apiService.data.generatedDocs = apiService.data.generatedDocs.filter(d => d.id !== docId);
      if (apiService.data.generatedDocs.length < initialLength) {
        apiService.persistData('generatedDocs');
        return { success: true };
      }
      return { success: false, message: 'Document not found or already deleted' };
    }
    // Downloading would typically be handled by the client after fetching doc info/content path
  },
  curriculum: {
    // --- Curriculums ---
    fetchCurriculums: async function() {
      await apiService.simulateDelay(200);
      return { success: true, data: [...apiService.data.curriculums] };
    },
    // Add/Update/Delete for Curriculums can be added if needed, for now, focusing on courses.

    // --- Courses ---
    fetchCourses: async function() {
      await apiService.simulateDelay(250);
      return { success: true, data: [...apiService.data.courses] };
    },
    addCourse: async function(courseData) {
      await apiService.simulateDelay(150);
      const newCourse = {
        id: `crs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...courseData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      apiService.data.courses.push(newCourse);
      apiService.persistData('courses');
      return { success: true, data: newCourse };
    },
    updateCourse: async function(courseId, updatedData) {
      await apiService.simulateDelay(150);
      const courseIndex = apiService.data.courses.findIndex(c => c.id === courseId);
      if (courseIndex > -1) {
        apiService.data.courses[courseIndex] = {
          ...apiService.data.courses[courseIndex],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        apiService.persistData('courses');
        return { success: true, data: apiService.data.courses[courseIndex] };
      }
      return { success: false, message: 'Course not found' };
    },
    deleteCourse: async function(courseId) {
      await apiService.simulateDelay(200);
      const initialLength = apiService.data.courses.length;
      apiService.data.courses = apiService.data.courses.filter(c => c.id !== courseId);
      if (apiService.data.courses.length < initialLength) {
        apiService.persistData('courses');
        // Cascade delete: Remove related program courses and course offerings
        apiService.data.programCourses = apiService.data.programCourses.filter(pc => pc.courseId !== courseId);
        apiService.persistData('programCourses');
        apiService.data.courseOfferings = apiService.data.courseOfferings.filter(co => co.courseId !== courseId);
        apiService.persistData('courseOfferings');
        return { success: true };
      }
      return { success: false, message: 'Course not found or already deleted' };
    },

    // --- Program Courses (Courses within a Curriculum/Program and Semester) ---
    fetchProgramCourses: async function(curriculumId) {
      await apiService.simulateDelay(200);
      const programCourses = curriculumId
        ? apiService.data.programCourses.filter(pc => pc.curriculumId === curriculumId)
        : [...apiService.data.programCourses];
      return { success: true, data: programCourses };
    },
    addProgramCourse: async function(programCourseData) {
      // programCourseData: { curriculumId, courseId, semester, ...otherDetails }
      await apiService.simulateDelay(150);
      const newProgramCourse = {
        id: `pc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...programCourseData
      };
      apiService.data.programCourses.push(newProgramCourse);
      apiService.persistData('programCourses');
      return { success: true, data: newProgramCourse };
    },
    updateProgramCourse: async function(programCourseId, updatedData) {
      await apiService.simulateDelay(150);
      const pcIndex = apiService.data.programCourses.findIndex(pc => pc.id === programCourseId);
      if (pcIndex > -1) {
        apiService.data.programCourses[pcIndex] = { ...apiService.data.programCourses[pcIndex], ...updatedData };
        apiService.persistData('programCourses');
        return { success: true, data: apiService.data.programCourses[pcIndex] };
      }
      return { success: false, message: 'Program course assignment not found' };
    },
    deleteProgramCourse: async function(programCourseId) {
      await apiService.simulateDelay(150);
      const initialLength = apiService.data.programCourses.length;
      apiService.data.programCourses = apiService.data.programCourses.filter(pc => pc.id !== programCourseId);
      if (apiService.data.programCourses.length < initialLength) {
        apiService.persistData('programCourses');
        return { success: true };
      }
      return { success: false, message: 'Program course assignment not found' };
    },

    // --- Course Offerings (Specific instance of a course for a semester, faculty, group) ---
    fetchCourseOfferings: async function(filters = {}) {
      // filters: { semester, facultyId, studentGroupId, courseId }
      await apiService.simulateDelay(250);
      let offerings = [...apiService.data.courseOfferings];
      if (filters.semester) {
        offerings = offerings.filter(co => co.semester === filters.semester);
      }
      if (filters.facultyId) {
        offerings = offerings.filter(co => co.facultyId === filters.facultyId);
      }
      // Add more filters as needed
      return { success: true, data: offerings };
    },
    addCourseOffering: async function(offeringData) {
      // offeringData: { courseId, semester, facultyId, studentGroupId, ... }
      await apiService.simulateDelay(150);
      const newOffering = {
        id: `co_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...offeringData
      };
      apiService.data.courseOfferings.push(newOffering);
      apiService.persistData('courseOfferings');
      return { success: true, data: newOffering };
    },
    updateCourseOffering: async function(offeringId, updatedData) {
      await apiService.simulateDelay(150);
      const coIndex = apiService.data.courseOfferings.findIndex(co => co.id === offeringId);
      if (coIndex > -1) {
        apiService.data.courseOfferings[coIndex] = { ...apiService.data.courseOfferings[coIndex], ...updatedData };
        apiService.persistData('courseOfferings');
        return { success: true, data: apiService.data.courseOfferings[coIndex] };
      }
      return { success: false, message: 'Course offering not found' };
    },
    deleteCourseOffering: async function(offeringId) {
      await apiService.simulateDelay(150);
      const initialLength = apiService.data.courseOfferings.length;
      apiService.data.courseOfferings = apiService.data.courseOfferings.filter(co => co.id !== offeringId);
      if (apiService.data.courseOfferings.length < initialLength) {
        apiService.persistData('courseOfferings');
        return { success: true };
      }
      return { success: false, message: 'Course offering not found' };
    }
  },
  faculty: {
    fetchFaculty: async function(status = 'all') { // status: 'active', 'archived', 'all'
      await apiService.simulateDelay(250);
      let facultyList = [...apiService.data.faculty];
      if (status === 'active') {
        facultyList = facultyList.filter(f => f.isActive !== false); // Assume active if isActive is true or undefined
      } else if (status === 'archived') {
        facultyList = facultyList.filter(f => f.isActive === false);
      }
      return { success: true, data: facultyList };
    },
    addFaculty: async function(facultyData) {
      await apiService.simulateDelay(200);
      const newFacultyMember = {
        id: `fac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...facultyData,
        isActive: true, // Default to active
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      apiService.data.faculty.push(newFacultyMember);
      apiService.persistData('faculty');
      return { success: true, data: newFacultyMember };
    },
    updateFaculty: async function(facultyId, updatedData) {
      await apiService.simulateDelay(200);
      const facultyIndex = apiService.data.faculty.findIndex(f => f.id === facultyId);
      if (facultyIndex > -1) {
        apiService.data.faculty[facultyIndex] = {
          ...apiService.data.faculty[facultyIndex],
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        apiService.persistData('faculty');
        return { success: true, data: apiService.data.faculty[facultyIndex] };
      }
      return { success: false, message: 'Faculty member not found' };
    },
    archiveFaculty: async function(facultyId) {
      await apiService.simulateDelay(150);
      const facultyIndex = apiService.data.faculty.findIndex(f => f.id === facultyId);
      if (facultyIndex > -1) {
        apiService.data.faculty[facultyIndex].isActive = false;
        apiService.data.faculty[facultyIndex].updatedAt = new Date().toISOString();
        apiService.persistData('faculty');
        return { success: true, data: apiService.data.faculty[facultyIndex] };
      }
      return { success: false, message: 'Faculty member not found' };
    },
    activateFaculty: async function(facultyId) {
      await apiService.simulateDelay(150);
      const facultyIndex = apiService.data.faculty.findIndex(f => f.id === facultyId);
      if (facultyIndex > -1) {
        apiService.data.faculty[facultyIndex].isActive = true;
        apiService.data.faculty[facultyIndex].updatedAt = new Date().toISOString();
        apiService.persistData('faculty');
        return { success: true, data: apiService.data.faculty[facultyIndex] };
      }
      return { success: false, message: 'Faculty member not found' };
    }
    // fetchTeacher profile is already in 'profiles' category
  },
  // ... (Other API categories will be added here)

  // --- Utility Methods ---
  getUserId: function() {
    return this._currentUserId;
  },
  isUserAuthenticated: function() { // Renamed to avoid conflict with AppProvider state
    return !!this._authToken;
  },
  // simulateDelay is already defined at the top level of apiService
  getRooms: async function() {
    await this.simulateDelay(50);
    return { success: true, data: [...this.data.rooms] };
  },
  getStudentGroups: async function() {
    await this.simulateDelay(50);
    return { success: true, data: [...this.data.studentGroups] };
  },
  getStudents: async function() { // This fetches from the top-level students array
    await this.simulateDelay(50);
    return { success: true, data: [...this.data.students] };
  },
  getCurriculums: async function() { // This is different from curriculum.fetchCurriculums
    await this.simulateDelay(50);
    return { success: true, data: [...this.data.curriculums] };
  },
  getAllCourses: async function() { // This is different from curriculum.fetchCourses
    await this.simulateDelay(50);
    return { success: true, data: [...this.data.courses] };
  }
};

// Initialize API data on load
apiService.initializeData();


export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const authStatus = await apiService.auth.checkAuthStatus();
      if (authStatus.isAuthenticated) {
        setIsAuthenticated(true);
        setCurrentUser(authStatus.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    const response = await apiService.auth.login(credentials);
    if (response.success) {
      setIsAuthenticated(true);
      setCurrentUser(response.user);
    } else {
      setError(response.message || 'Login failed');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
    setLoading(false);
    return response;
  };

  const logout = async () => {
    setLoading(true);
    await apiService.auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoading(false);
    setError(null); // Clear any previous errors on logout
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      loading,
      error,
      login,
      logout,
      // Expose API service for components that need direct access (use with caution)
      // For most cases, data should be fetched/mutated via AppProvider functions
      apiService
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;