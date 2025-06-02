const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

// System admin dashboard routes
router.get('/system-admin', protect, authorize('systemAdmin'), dashboardController.getSystemAdminStats);

// Admin dashboard routes
router.get('/admin', protect, authorize('admin'), dashboardController.getAdminStats);

// Block head dashboard routes
router.get('/block-head', protect, authorize('blockHead'), dashboardController.getBlockHeadStats);

module.exports = router; 