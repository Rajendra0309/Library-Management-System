const express = require('express');
const router = express.Router();
const { getConfig, updateConfig } = require('../controllers/config.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getConfig);
router.put('/', protect, updateConfig);

module.exports = router;
