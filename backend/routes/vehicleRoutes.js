const express = require('express');
const router = express.Router();
const { getVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, assignDriver, removeDriver } = require('../controllers/vehicleController');

router.route('/').get(getVehicles).post(createVehicle);
router.route('/:id').get(getVehicle).put(updateVehicle).delete(deleteVehicle);
router.post('/:id/assign-driver', assignDriver);
router.delete('/:id/remove-driver/:driverId', removeDriver);

module.exports = router;
