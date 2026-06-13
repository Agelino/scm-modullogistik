const express = require('express');
const router = express.Router();
const { updateLocation, getTracking, getTrackingHistory, getActiveFleet } = require('../controllers/trackingController');

router.post('/update', updateLocation);
router.get('/active/all', getActiveFleet);
router.get('/:planId', getTracking);
router.get('/:planId/history', getTrackingHistory);

module.exports = router;
