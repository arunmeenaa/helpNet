const express = require("express");

const {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
} = require("../controllers/requestController");

const { auth } = require("../middleware/auth");

const router = express.Router();

// ==========================================
// GET ALL REQUESTS
// ==========================================
router.get("/", auth, getAllRequests);

// ==========================================
// GET MY REQUESTS
// ==========================================
router.get("/me", auth, getMyRequests);

// ==========================================
// CREATE REQUEST
// ==========================================
router.post("/", auth, createRequest);

// ==========================================
// UPDATE REQUEST STATUS
// ==========================================
router.patch(
  "/:id/status",
  auth,
  updateRequestStatus
);

// ==========================================
// UPDATE REQUEST
// ==========================================
router.patch(
  "/:id",
  auth,
  updateRequest
);

// ==========================================
// DELETE REQUEST
// ==========================================
router.delete(
  "/:id",
  auth,
  deleteRequest
);

// ==========================================
// GET SINGLE REQUEST
// ==========================================
router.get(
  "/:id",
  auth,
  getRequestById
);

module.exports = router;