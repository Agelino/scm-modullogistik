const Student = require('../models/Student');

// GET /api/students
exports.getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.schoolId) filter.school = req.query.schoolId;

    const students = await Student.find(filter)
      .populate('school', 'name district')
      .sort({ name: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/students/school/:schoolId
exports.getStudentsBySchool = async (req, res) => {
  try {
    const students = await Student.find({ school: req.params.schoolId })
      .sort({ name: 1 });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/students
exports.createStudent = async (req, res) => {
  try {
    const { school, name, studentId, className, isActive } = req.body;
    const student = await Student.create({ school, name, studentId, className, isActive });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/students/:id
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/students/:id
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Siswa tidak ditemukan' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
