const express = require("express");
const router = express.Router();
const {
  suspendUser,
  reinstateUser,
  getDashboardStats,
  getAuditLogs,
} = require("../controllers/adminController");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

router.use(auth, isAdmin);

router.post("/suspend-user", suspendUser);
router.post("/reinstate-user", reinstateUser);
router.get("/dashboard-stats", getDashboardStats);
router.get("/audit-logs", getAuditLogs);

module.exports = router;
