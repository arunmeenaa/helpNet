const mongoose = require("mongoose");
const Offer = require("../models/Offer");
const User = require("../models/User");
const { distanceInKm } = require("../utils/distance");

const isWithinNearbyRadius = (offer, user) => {
  if (offer.visibility !== "nearby") {
    return false;
  }

  const offerLat = offer.locationCoordinates?.lat;
  const offerLng = offer.locationCoordinates?.lng;

  const userLat = user.coordinates?.lat;
  const userLng = user.coordinates?.lng;

  if (
    !Number.isFinite(Number(offerLat)) ||
    !Number.isFinite(Number(offerLng)) ||
    !Number.isFinite(Number(userLat)) ||
    !Number.isFinite(Number(userLng))
  ) {
    return false;
  }

  const distance = distanceInKm(
    Number(userLat),
    Number(userLng),
    Number(offerLat),
    Number(offerLng),
  );

  return distance <= Number(offer.radius || 2);
};

const canViewOffer = (offer, user) => {
  const offerAuthorId =
    offer.author?._id?.toString() || offer.author?.toString();

  const userId = user._id?.toString();

  // Own offer
  if (offerAuthorId === userId) {
    return true;
  }

  // Apartment offer
  if (
    offer.visibility === "apartment" &&
    offer.apartmentId &&
    user.apartmentId &&
    offer.apartmentId.toString() === user.apartmentId.toString()
  ) {
    return true;
  }

  // Nearby offer
  return isWithinNearbyRadius(offer, user);
};

const getAllOffers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const offers = await Offer.find({
      status: {
        $nin: ["resolved", "cancelled"],
      },
    }).sort({ createdAt: -1 });

    const visibleOffers = offers.filter((offer) => canViewOffer(offer, user));

    await Offer.populate(visibleOffers, {
      path: "author",
      select: "fullName location coordinates",
    });

    res.json(visibleOffers);
  } catch (error) {
    console.error("Get offers error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMyOffers = async (req, res) => {
  try {
    const myOffers = await Offer.find({
      author: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(myOffers);
  } catch (error) {
    console.error("Get my offers error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const offer = await Offer.findById(id).populate("author", "fullName");

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user || !canViewOffer(offer, user)) {
      return res.status(403).json({
        message: "This offer is not available in your area.",
      });
    }

    res.json(offer);
  } catch (error) {
    console.error("Get offer error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const createOffer = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      title,
      description,
      category,
      location,
      availability,
      visibility = "apartment",
      radius = 5,
      latitude,
      longitude,
      coordinates,
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    if (!["apartment", "nearby"].includes(visibility)) {
      return res.status(400).json({
        message: "Invalid visibility.",
      });
    }

    // Apartment posts require an apartment
    if (visibility === "apartment" && !user.apartmentId) {
      return res.status(400).json({
        message: "You must join an apartment to create an apartment offer.",
      });
    }
    const userLat = Number(user.coordinates?.lat);
    const userLng = Number(user.coordinates?.lng);

    if (
      visibility === "nearby" &&
      (!Number.isFinite(userLat) || !Number.isFinite(userLng))
    ) {
      return res.status(400).json({
        message: "Please set your location before creating a nearby offer.",
      });
    }

    const lat =
      visibility === "nearby"
        ? userLat
        : Number(
            latitude ??
              coordinates?.lat ??
              coordinates?.latitude ??
              user.coordinates?.lat,
          );

    const lng =
      visibility === "nearby"
        ? userLng
        : Number(
            longitude ??
              coordinates?.lng ??
              coordinates?.longitude ??
              user.coordinates?.lng,
          );

    // Never save invalid coordinates
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        message: "Unable to determine a valid location.",
      });
    }

    const newOffer = new Offer({
      title,
      description,
      category,
      location,
      availability,

      author: req.user.id,

      apartmentId: user.apartmentId || null,

      visibility,

      radius:
        visibility === "nearby"
          ? Math.min(Math.max(Number(radius) || 2, 1), 20)
          : 2,

      locationCoordinates: {
        lat,
        lng,
      },
    });

    const savedOffer = await newOffer.save();

    const io = req.app.get("io");

    if (io) {
      if (visibility === "apartment") {
        io.to(user.apartmentId.toString()).emit("notification", {
          type: "new_offer",
          title: "New Offer",
          message: `${user.fullName} posted a new offer: ${savedOffer.title}`,
          postId: savedOffer._id.toString(),
          postType: "offer",
        });
      }

      if (visibility === "nearby") {
        const nearbyUsers = await User.find({
          _id: { $ne: req.user.id },
          "coordinates.lat": { $ne: null },
          "coordinates.lng": { $ne: null },
        }).lean();

        const radiusKm = Number(savedOffer.radius || 5);

        for (const nearbyUser of nearbyUsers) {
          const userLat = Number(nearbyUser.coordinates?.lat);
          const userLng = Number(nearbyUser.coordinates?.lng);

          if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
            continue;
          }

          const distance = distanceInKm(userLat, userLng, lat, lng);

          console.log(`📍 ${nearbyUser.fullName}: ${distance.toFixed(2)} km`);

          if (distance <= radiusKm) {
            console.log(`🔔 Sending offer notification to ${nearbyUser._id}`);

            io.to(nearbyUser._id.toString()).emit("notification", {
              type: "new_offer",
              title: "New Nearby Offer",
              message: `${user.fullName} posted "${savedOffer.title}" ${distance.toFixed(1)} km away.`,
              postId: savedOffer._id.toString(),
              postType: "offer",
            });
          }
        }
      }
    }
    const populatedOffer = await savedOffer.populate(
      "author",
      "fullName location coordinates",
    );

    res.status(201).json(populatedOffer);
  } catch (error) {
    console.error("Create offer error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (offer.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "status",
      "visibility",
      "radius",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        offer[field] = req.body[field];
      }
    });

    const updatedOffer = await offer.save();

    res.json(updatedOffer);
  } catch (error) {
    console.error("Update offer error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const validStatuses = ["open", "resolved", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (offer.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    offer.status = status;

    const updatedOffer = await offer.save();

    res.json(updatedOffer);
  } catch (error) {
    console.error("Offer status error:", error);

    res.status(500).json({
      message: "Server error updating offer status",
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    if (offer.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await offer.deleteOne();

    res.json({
      message: "Offer removed successfully",
    });
  } catch (error) {
    console.error("Delete offer error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllOffers,
  getMyOffers,
  getOfferById,
  createOffer,
  updateOffer,
  updateOfferStatus,
  deleteOffer,
};
