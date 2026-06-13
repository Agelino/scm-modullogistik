const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentsBySchool,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

router.get('/', getStudents);
router.get('/school/:schoolId', getStudentsBySchool);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
