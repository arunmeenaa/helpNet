const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");

const { distanceInKm } = require("../utils/distance");

const isWithinNearbyRadius = (post, user) => {
  if (post.visibility !== "nearby") {
    return false;
  }

  const postLat = post.locationCoordinates?.lat;
  const postLng = post.locationCoordinates?.lng;

  const userLat = user.coordinates?.lat;
  const userLng = user.coordinates?.lng;

  if (
    !Number.isFinite(Number(postLat)) ||
    !Number.isFinite(Number(postLng)) ||
    !Number.isFinite(Number(userLat)) ||
    !Number.isFinite(Number(userLng))
  ) {
    return false;
  }

  const distance = distanceInKm(
    Number(userLat),
    Number(userLng),
    Number(postLat),
    Number(postLng),
  );

  return distance <= Number(post.radius || 2);
};

const canViewRequest = (request, user) => {
  if (request.author?.toString() === user._id?.toString()) {
    return true;
  }

  if (
    request.visibility === "apartment" &&
    request.apartmentId?.toString() === user.apartmentId?.toString()
  ) {
    return true;
  }

  return isWithinNearbyRadius(request, user);
};

const getAllRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const requests = await Request.find({
      status: {
        $nin: ["resolved", "cancelled"],
      },
    })
      .populate("author", "fullName location")
      .sort({ createdAt: -1 });

    const visibleRequests = requests.filter((request) => {
      const visible = canViewRequest(request, user);

      if (request.visibility === "nearby") {
        const requestLat = Number(request.locationCoordinates?.lat);

        const requestLng = Number(request.locationCoordinates?.lng);

        const userLat = Number(user.coordinates?.lat);

        const userLng = Number(user.coordinates?.lng);

        const distance =
          Number.isFinite(requestLat) &&
          Number.isFinite(requestLng) &&
          Number.isFinite(userLat) &&
          Number.isFinite(userLng)
            ? distanceInKm(userLat, userLng, requestLat, requestLng)
            : null;
      }

      return visible;
    });

    res.json(visibleRequests);
  } catch (error) {
    console.error("Get requests error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const myRequests = await Request.find({
      author: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(myRequests);
  } catch (error) {
    console.error("Get my requests error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const request = await Request.findById(id).populate("author", "fullName");

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (!canViewRequest(request, user)) {
      return res.status(403).json({
        message: "This request is not available in your area.",
      });
    }

    res.json(request);
  } catch (error) {
    console.error("Get request error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const createRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      priority,
      visibility = "apartment",
      radius = 2,
      latitude,
      longitude,
      coordinates,
    } = req.body;

    if (!["apartment", "nearby"].includes(visibility)) {
      return res.status(400).json({
        message: "Invalid visibility.",
      });
    }

    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (visibility === "apartment" && !user.apartmentId) {
      return res.status(403).json({
        message: "You must be in an apartment to create an apartment request.",
      });
    }

    if (!title || !description || !location || !priority) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    const userLat = Number(user.coordinates?.lat);
    const userLng = Number(user.coordinates?.lng);

    if (
      visibility === "nearby" &&
      (!Number.isFinite(userLat) || !Number.isFinite(userLng))
    ) {
      return res.status(400).json({
        message: "Please set your location before creating a nearby request.",
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
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        message: "Unable to determine a valid location.",
      });
    }

    if (
      visibility === "nearby" &&
      (!Number.isFinite(lat) || !Number.isFinite(lng))
    ) {
      console.error("❌ REFUSING NEARBY REQUEST WITH INVALID COORDINATES", {
        lat,
        lng,
        userCoordinates: user.coordinates,
      });

      return res.status(400).json({
        message:
          "Unable to determine a valid location. Please set your location again.",
      });
    }
    const newRequest = new Request({
      title,
      description,
      location,
      priority,
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
    console.log("========== CREATE REQUEST LOCATION ==========");
    console.log("User ID:", user._id);
    console.log("User coordinates:", user.coordinates);
    console.log("userLat:", userLat);
    console.log("userLng:", userLng);
    console.log("Final lat:", lat);
    console.log("Final lng:", lng);
    console.log("Visibility:", visibility);
    console.log("=============================================");
    const savedRequest = await newRequest.save();
    console.log("========== SAVED REQUEST LOCATION ==========");
    console.log("Saved coordinates:", savedRequest.locationCoordinates);
    console.log("============================================");
    const io = req.app.get("io");

    if (io) {
      if (visibility === "apartment") {
        io.to(user.apartmentId.toString()).emit("notification", {
          type: "new_request",
          title: "New Request",
          message: `${user.fullName} posted a new request: ${savedRequest.title}`,
          postId: savedRequest._id.toString(),
          postType: "request",
        });
      }

      if (visibility === "nearby") {
        const nearbyUsers = await User.find({
          _id: { $ne: req.user.id },
          "coordinates.lat": { $ne: null },
          "coordinates.lng": { $ne: null },
        }).lean();

        const radiusKm = Number(savedRequest.radius || 2);

        for (const nearbyUser of nearbyUsers) {
          const userLat = Number(nearbyUser.coordinates?.lat);
          const userLng = Number(nearbyUser.coordinates?.lng);

          if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
            continue;
          }

          const distance = distanceInKm(userLat, userLng, lat, lng);

          console.log(`📍 ${nearbyUser.fullName}: ${distance.toFixed(2)} km`);

          if (distance <= radiusKm) {
            console.log(`🔔 Sending request notification to ${nearbyUser._id}`);

            io.to(nearbyUser._id.toString()).emit("notification", {
              type: "new_request",
              title: "New Nearby Request",
              message: `${user.fullName} posted "${savedRequest.title}" ${distance.toFixed(1)} km away.`,
              postId: savedRequest._id.toString(),
              postType: "request",
            });
          }
        }
      }
    }
    const populatedRequest = await savedRequest.populate(
      "author",
      "fullName location coordinates",
    );

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const updateRequestStatus = async (req, res) => {
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

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Only owner can change status
    if (request.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    request.status = status;

    const updatedRequest = await request.save();

    res.json(updatedRequest);
  } catch (error) {
    console.error("Status Update Error:", error);

    res.status(500).json({
      message: "Server error updating status",
    });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Only owner can update
    if (request.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "priority",
      "status",
      "visibility",
      "radius",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        request[field] = req.body[field];
      }
    });

    const updatedRequest = await request.save();

    res.json(updatedRequest);
  } catch (error) {
    console.error("Update request error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID",
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Only owner can delete
    if (request.author.toString() !== req.user.id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await request.deleteOne();

    res.json({
      message: "Request removed successfully",
    });
  } catch (error) {
    console.error("Delete request error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getAllRequests,
  getMyRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  updateRequest,
  deleteRequest,
};
