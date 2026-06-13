const express = require('express');
const router = express.Router();
const { getReadyPortions, getProductionStatus, calculateLoadPlan, getDeliveryPlans, createDeliveryPlan, updatePlanStatus } = require('../controllers/loadPlanController');

router.get('/ready-portions', getReadyPortions);
router.get('/production-status', getProductionStatus);
router.post('/calculate', calculateLoadPlan);
router.route('/').get(getDeliveryPlans).post(createDeliveryPlan);
router.patch('/:id/status', updatePlanStatus);

module.exports = router;
