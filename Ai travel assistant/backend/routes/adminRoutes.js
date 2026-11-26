const express = require('express');
const router = express.Router();
const multer = require('multer');
const { adminProtect, requireAdminRole } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// File upload support for CSV imports (strict extension + MIME filter)
const csvUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const ext = require('path').extname(file.originalname || '').toLowerCase();
        const allowedMimes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'];
        if (ext !== '.csv' || !allowedMimes.includes(file.mimetype)) {
            return cb(new Error('Only CSV files are allowed for dataset import.'));
        }
        cb(null, true);
    }
});

const { adminLogin } = require('../controllers/authController');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    resetUserPassword,
    bulkUpdateUsers,
    getAnalytics,
    getActiveSessions,
    revokeSession,
    getLoginHistory,
    resetDatabase,
    getAuditLogs,
    getTrains,
    getTrainDetails,
    createTrain,
    deleteTrain,
    updateLiveTrainStatus,
    getBookings,
    updateBooking,
    createBooking,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getSecurityAlerts,
    resolveSecurityAlert,
    getSearchAnalytics,
    getSystemHealth,
    triggerMlRetrain,
    getStations,
    createStation,
    updateStation,
    deleteStation,
    uploadDataset,
    getAdminSecuritySettings,
    updateAdminSecuritySettings,
    getRouteManagement,
    getRevenueAnalytics,
    getAnnouncements,
    createAnnouncement,
    toggleAnnouncement,
    deleteAnnouncement,
    exportReport,
    getUserActivity,
    getAdminAccounts,
    updateAdminRole
} = require('../controllers/adminController');

const {
    getDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination
} = require('../controllers/adminDestinationController');

const {
    getReports,
    updateReport,
    createReport
} = require('../controllers/adminReportController');

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/adminNotificationController');

const {
    getKnowledgeBase,
    addKnowledge,
    updateKnowledge,
    deleteKnowledge
} = require('../controllers/chatbotController');

const { getAllTickets, replyToTicket } = require('../controllers/supportController');

// ─── Public admin auth routes (rate-limited) ───
router.post('/login', loginLimiter, adminLogin);

// ─── Protected admin dashboard routes ───
router.use(adminProtect);

// 1. Users (Standard Admin & Super Admin)
router.get('/users', requireAdminRole(['admin']), getUsers);
router.get('/users/:id', requireAdminRole(['admin']), getUserById);
router.put('/users/:id', requireAdminRole(['admin']), updateUser);
router.delete('/users/:id', requireAdminRole(['admin']), deleteUser);
router.post('/users/:id/reset-password', requireAdminRole(['admin']), resetUserPassword);
router.post('/users/bulk', requireAdminRole(['admin']), bulkUpdateUsers);
router.get('/users/:id/activity', requireAdminRole(['admin']), getUserActivity);

// 2. Dashboard Analytics & Health
router.get('/analytics', requireAdminRole(['admin', 'data_manager']), getAnalytics);
router.get('/system-health', requireAdminRole(['admin', 'data_manager', 'support_admin']), getSystemHealth);
router.get('/system-status', requireAdminRole(['admin', 'data_manager', 'support_admin']), getSystemHealth);
router.get('/sessions', requireAdminRole(['admin']), getActiveSessions);
router.delete('/sessions/:sessionId', requireAdminRole(['admin']), revokeSession);
router.get('/login-history', requireAdminRole(['admin']), getLoginHistory);
router.get('/audit-logs', requireAdminRole(['admin']), getAuditLogs);
router.post('/reset-database', requireAdminRole(['super_admin']), resetDatabase);

// 3. Trains & Stations (Admin & Data Manager)
router.get('/trains', requireAdminRole(['admin', 'data_manager']), getTrains);
router.get('/trains/:trainNumber', requireAdminRole(['admin', 'data_manager']), getTrainDetails);
router.post('/trains', requireAdminRole(['admin', 'data_manager']), createTrain);
router.delete('/trains/:trainNumber', requireAdminRole(['admin', 'data_manager']), deleteTrain);
router.post('/trains/live-status', requireAdminRole(['admin', 'data_manager']), updateLiveTrainStatus);
router.get('/stations', requireAdminRole(['admin', 'data_manager']), getStations);
router.post('/stations', requireAdminRole(['admin', 'data_manager']), createStation);
router.put('/stations/:stationCode', requireAdminRole(['admin', 'data_manager']), updateStation);
router.delete('/stations/:stationCode', requireAdminRole(['admin', 'data_manager']), deleteStation);

// 4. Destinations (Admin & Data Manager)
router.get('/destinations', requireAdminRole(['admin', 'data_manager']), getDestinations);
router.get('/destinations/:id', requireAdminRole(['admin', 'data_manager']), getDestinationById);
router.post('/destinations', requireAdminRole(['admin', 'data_manager']), createDestination);
router.put('/destinations/:id', requireAdminRole(['admin', 'data_manager']), updateDestination);
router.delete('/destinations/:id', requireAdminRole(['admin', 'data_manager']), deleteDestination);

// 5. Reports & Issues (Admin & Support Admin)
router.get('/reports', requireAdminRole(['admin', 'support_admin']), getReports);
router.post('/reports', requireAdminRole(['admin', 'support_admin']), createReport);
router.put('/reports/:id', requireAdminRole(['admin', 'support_admin']), updateReport);

// 6. Notifications (Admin & Support Admin)
router.get('/notifications', requireAdminRole(['admin', 'support_admin']), getNotifications);
router.put('/notifications/mark-all-read', requireAdminRole(['admin', 'support_admin']), markAllAsRead);
router.put('/notifications/:id/read', requireAdminRole(['admin', 'support_admin']), markAsRead);
router.delete('/notifications/:id', requireAdminRole(['admin', 'support_admin']), deleteNotification);

// 7. Admin Accounts & RBAC (Super Admin Only for Role Modification)
router.get('/admins', requireAdminRole(['admin']), getAdminAccounts);
router.put('/admins/:id/role', requireAdminRole(['super_admin']), updateAdminRole);

// 8. Bookings & Coupons (Admin)
router.get('/bookings', requireAdminRole(['admin', 'support_admin']), getBookings);
router.post('/bookings', requireAdminRole(['admin']), createBooking);
router.put('/bookings/:id', requireAdminRole(['admin']), updateBooking);
router.get('/coupons', requireAdminRole(['admin']), getCoupons);
router.post('/coupons', requireAdminRole(['admin']), createCoupon);
router.put('/coupons/:id', requireAdminRole(['admin']), updateCoupon);
router.delete('/coupons/:id', requireAdminRole(['admin']), deleteCoupon);

// 9. Support & Security
router.get('/tickets', requireAdminRole(['admin', 'support_admin']), getAllTickets);
router.put('/tickets/:ticketId', requireAdminRole(['admin', 'support_admin']), replyToTicket);
router.get('/security-alerts', requireAdminRole(['admin']), getSecurityAlerts);
router.put('/security-alerts/:id/resolve', requireAdminRole(['admin']), resolveSecurityAlert);
router.get('/security/settings', requireAdminRole(['admin']), getAdminSecuritySettings);
router.post('/security/settings', requireAdminRole(['admin']), updateAdminSecuritySettings);

// 10. Search & ML & Datasets
router.get('/searches', requireAdminRole(['admin', 'data_manager']), getSearchAnalytics);
router.post('/ml/retrain', requireAdminRole(['admin', 'data_manager']), triggerMlRetrain);
router.post('/upload-dataset', requireAdminRole(['admin', 'data_manager']), csvUpload.single('file'), uploadDataset);
router.get('/routes-management', requireAdminRole(['admin', 'data_manager']), getRouteManagement);
router.get('/revenue-analytics', requireAdminRole(['admin']), getRevenueAnalytics);
router.get('/export/:type', requireAdminRole(['admin']), exportReport);

// 11. Announcements & Chatbot Knowledge
router.get('/announcements', requireAdminRole(['admin', 'support_admin']), getAnnouncements);
router.post('/announcements', requireAdminRole(['admin']), createAnnouncement);
router.put('/announcements/:id/toggle', requireAdminRole(['admin']), toggleAnnouncement);
router.get('/chatbot/knowledge', requireAdminRole(['admin', 'data_manager']), getKnowledgeBase);
router.post('/chatbot/knowledge', requireAdminRole(['admin', 'data_manager']), addKnowledge);
router.put('/chatbot/knowledge/:id', requireAdminRole(['admin', 'data_manager']), updateKnowledge);
router.delete('/chatbot/knowledge/:id', requireAdminRole(['admin', 'data_manager']), deleteKnowledge);

// 12. B2B Developer API Key & Organization Governance (Admin Only)
const {
  adminGetAllApiKeys,
  adminUpdateApiKey,
  adminGetAllOrganizations,
  adminUpdateOrganization
} = require('../controllers/apiKeyController');

router.get('/developer/keys', requireAdminRole(['admin']), adminGetAllApiKeys);
router.put('/developer/keys/:keyId', requireAdminRole(['admin']), adminUpdateApiKey);
router.get('/developer/organizations', requireAdminRole(['admin']), adminGetAllOrganizations);
router.put('/developer/organizations/:orgId', requireAdminRole(['admin']), adminUpdateOrganization);

module.exports = router;

