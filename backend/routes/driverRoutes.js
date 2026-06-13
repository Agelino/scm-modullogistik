const express = require('express');
const router = express.Router();
const { getDrivers, getDriver, createDriver, updateDriver, deleteDriver, updateStatus } = require('../controllers/driverController');

router.route('/').get(getDrivers).post(createDriver);
router.route('/:id').get(getDriver).put(updateDriver).delete(deleteDriver);
router.patch('/:id/status', updateStatus);

module.exports = router;
