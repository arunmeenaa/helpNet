const express = require("express");

const {
  getAllOffers,
  getMyOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer,
} = require("../controllers/offerController");

const { auth } = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, getAllOffers);

router.get("/me", auth, getMyOffers);

router.post("/", auth, createOffer);

router.patch(
  "/:id/status",
  auth,
  updateOfferStatus
);

router.patch(
  "/:id",
  auth,
  updateOffer
);


router.delete(
  "/:id",
  auth,
  deleteOffer
);

router.get(
  "/:id",
  auth,
  getOfferById
);

module.exports = router;