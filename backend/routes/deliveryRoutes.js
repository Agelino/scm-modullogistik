const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { confirmDelivery, getDeliveriesByPlan, getAllDeliveries, updateDeliveryStatus, createDeliveriesFromPlan } = require('../controllers/deliveryController');

router.get('/', getAllDeliveries);
router.post('/', createDeliveriesFromPlan);
router.get('/plan/:planId', getDeliveriesByPlan);
router.post('/:id/confirm', upload.single('photo'), confirmDelivery);
router.patch('/:id/status', updateDeliveryStatus);

module.exports = router;
