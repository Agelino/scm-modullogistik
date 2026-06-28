const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getKitchenLocation } = require('../controllers/settingsController');

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/kitchen-location', getKitchenLocation);

module.exports = router;
