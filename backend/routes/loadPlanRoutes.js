const express = require('express');
const router = express.Router();
const { getReadyPortions, getProductionStatus, calculateLoadPlan, getDeliveryPlans, createDeliveryPlan, updatePlanStatus, getDeliveryPlansByNovalDriver } = require('../controllers/loadPlanController');

router.get('/ready-portions', getReadyPortions);
router.get('/production-status', getProductionStatus);
router.post('/calculate', calculateLoadPlan);
router.get('/driver/:novalDriverId', getDeliveryPlansByNovalDriver);
router.route('/').get(getDeliveryPlans).post(createDeliveryPlan);
router.patch('/:id/status', updatePlanStatus);

module.exports = router;
