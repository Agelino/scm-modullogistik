const express = require('express');
const router = express.Router();
const { getSchools, getSchool, createSchool, updateSchool, deleteSchool, getPortionStats, geocode, schoolLogin } = require('../controllers/schoolController');

router.get('/stats/portions', getPortionStats);
router.get('/geocode', geocode);
router.post('/login', schoolLogin);
router.route('/').get(getSchools).post(createSchool);
router.route('/:id').get(getSchool).put(updateSchool).delete(deleteSchool);

module.exports = router;
