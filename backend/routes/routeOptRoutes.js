const express = require('express');
const router = express.Router();
const { optimize, getRouteByPlan, getRoutes } = require('../controllers/routeOptController');

router.post('/optimize', optimize);
router.get('/', getRoutes);
router.get('/:planId', getRouteByPlan);

module.exports = router;
