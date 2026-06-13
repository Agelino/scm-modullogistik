const express = require('express');
const router = express.Router();
const { getPerformance, getFuelEfficiency, getOnTimeRate, getDashboardStats } = require('../controllers/analyticsController');

router.get('/dashboard', getDashboardStats);
router.get('/performance', getPerformance);
router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/on-time-rate', getOnTimeRate);

module.exports = router;
