const mongoose = require("mongoose");
const User = require("../models/User");
const Apartment = require("../models/Apartment");
const JoinRequest = require("../models/JoinRequest");
const Request = require("../models/Request");
const Offer = require("../models/Offer");
const generateToken = require("../utils/generateToken");

const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image file to upload.",
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePic: imagePath,
      },
      {
        new: true,
      },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Notify apartment residents
    try {
      const io = req.app.get("io");

      if (io && updatedUser.apartmentId) {
        io.to(updatedUser.apartmentId.toString()).emit(
          "resident_profile_updated",
          updatedUser,
        );
      }
    } catch (socketError) {
      console.warn("Profile update socket skipped:", socketError.message);
    }

    return res.json({
      message: "Profile picture updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile picture update error:", error);

    return res.status(500).json({
      message: "Database lookup error encountered.",
    });
  }
};

// ==========================================
// CREATE APARTMENT
// POST /api/admin/create-apartment
// ==========================================
const createApartment = async (req, res) => {
  try {
    // Only owner can create apartment
    if (req.user.role !== "owner") {
      return res.status(403).json({
        message: "Only owners can create apartments",
      });
    }

    const { name, apartmentId } = req.body;

    if (!name || !apartmentId) {
      return res.status(400).json({
        message: "Apartment name and ID are required",
      });
    }

    const normalizedId = apartmentId.trim().toLowerCase();

    // Check whether ID already exists
    const existingApartment = await Apartment.findOne({
      apartmentId: normalizedId,
    });

    if (existingApartment) {
      return res.status(400).json({
        message: "Apartment ID already exists",
      });
    }

    // Get owner
    const owner = await User.findById(req.user.id);

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found",
      });
    }

    // Prevent owner from creating multiple apartments
    if (owner.apartmentId) {
      return res.status(400).json({
        message: "You already have an apartment.",
      });
    }

    // Create apartment
    const apartment = await Apartment.create({
      name: name.trim(),
      apartmentId: normalizedId,
      owner: owner._id,
    });

    // IMPORTANT:
    // Link apartment to owner
    owner.apartmentId = normalizedId;
    await owner.save();
    const savedOwner = await User.findById(owner._id).select(
      "_id fullName role apartmentId",
    );

    console.log("========== OWNER AFTER SAVE ==========");
    console.log(savedOwner);
    console.log("======================================");
    res.status(201).json({
      message: "Apartment created successfully",
      apartment: {
        id: apartment._id,
        name: apartment.name,
        apartmentId: apartment.apartmentId,
        owner: apartment.owner,
      },
    });
  } catch (error) {
    console.error("Create apartment error:", error);

    res.status(500).json({
      message: "Server error creating apartment",
    });
  }
};
const getMyApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findOne({
      owner: req.user.id,
    }).populate("owner", "fullName email");

    if (!apartment) {
      return res.status(404).json({
        message: "Apartment not found",
      });
    }

    // Keep User document synchronized
    const owner = await User.findById(req.user.id);

    if (owner && owner.apartmentId !== apartment.apartmentId) {
      owner.apartmentId = apartment.apartmentId;
      await owner.save();
    }

    res.json({
      apartment,
    });
  } catch (error) {
    console.error("Get owner apartment error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// ==========================================
// GET USER PROFILE
// ADMIN ONLY
// GET /api/admin/user/:id
// ==========================================
const getUserProfile = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id).select("-password");

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Same apartment only
    if (targetUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied. Not a member of this community complex.",
      });
    }

    res.json(targetUser);
  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// GET MEMBERS
// ADMIN ONLY
// GET /api/admin/members
// ==========================================
const getMembers = async (req, res) => {
  try {
    const owner = await User.findById(req.user.id).select(
      "fullName role apartmentId",
    );

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found.",
      });
    }

    if (owner.role !== "owner") {
      return res.status(403).json({
        message: `Invalid role: ${owner.role}`,
      });
    }

    if (!owner.apartmentId) {
      return res.status(400).json({
        message: "Owner is not assigned to an apartment.",
      });
    }

    const members = await User.find({
      apartmentId: owner.apartmentId,
      role: "resident",
    })
      .select("fullName email createdAt profilePic")
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    console.error("Get members error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// REMOVE USER
// ADMIN ONLY
// DELETE /api/admin/remove-user/:id
// ==========================================
const removeUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);

    if (!targetUser) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Cannot remove another apartment's user
    if (targetUser.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    // Prevent admin from removing themselves
    if (targetUser._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot remove yourself from the community.",
      });
    }

    // Remove apartment membership
    targetUser.apartmentId = null;
    targetUser.isEvicted = true;

    await targetUser.save();

    // Delete user's requests
    const deletedRequests = await Request.deleteMany({
      author: targetUser._id,
    });

    // Delete user's offers
    const deletedOffers = await Offer.deleteMany({
      author: targetUser._id,
    });

    console.log(
      `🧹 Deleted ${deletedRequests.deletedCount} requests and ${deletedOffers.deletedCount} offers for evicted user ${targetUser._id}`,
    );

    // Socket notifications
    const io = req.app.get("io");

    if (io) {
      // Notify removed user
      const userRoom = targetUser._id.toString();

      io.to(userRoom).emit("user_removed", {
        message: "You have been removed from the community.",
      });

      // Tell apartment residents to refresh feed
      io.to(req.user.apartmentId).emit("feed_updated");
    }

    res.json({
      message: "User removed and community posts cleared successfully.",
    });
  } catch (error) {
    console.error("Remove user error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// CREATE JOIN REQUEST
// USER
// POST /api/admin/join-requests
// ==========================================
const createJoinRequest = async (req, res) => {
  try {
    const { apartmentId } = req.body;

    if (!apartmentId) {
      return res.status(400).json({
        message: "Apartment ID is required.",
      });
    }

    const cleanApartmentId = apartmentId.trim().toLowerCase();

    // Verify apartment exists
    const apartment = await Apartment.findOne({
      apartmentId: cleanApartmentId,
    });

    if (!apartment) {
      return res.status(404).json({
        message: "Apartment not found.",
      });
    }

    // Don't allow existing member to request again
    const user = await User.findById(req.user.id);

    if (user && user.apartmentId === cleanApartmentId) {
      return res.status(400).json({
        message: "You are already a member of this apartment.",
      });
    }

    // Check pending request
    const existing = await JoinRequest.findOne({
      userId: req.user.id,
      apartmentId: cleanApartmentId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        message: "Request already pending.",
      });
    }

    const newRequest = new JoinRequest({
      userId: req.user.id,
      apartmentId: cleanApartmentId,
      status: "pending",
    });

    await newRequest.save();

    const populatedRequest = await JoinRequest.findById(
      newRequest._id,
    ).populate("userId", "fullName email");

    // Notify apartment admin
    const io = req.app.get("io");

    if (io) {
      const roomName = `admin_${cleanApartmentId}`;

      io.to(roomName).emit("new_join_request", {
        message: "New join request received!",
        request: populatedRequest,
      });
    }

    res.status(201).json({
      message: "Request submitted.",
    });
  } catch (error) {
    console.error("Create join request error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Request already pending.",
      });
    }

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// REJECT JOIN REQUEST
// ADMIN ONLY
// DELETE /api/admin/reject-join
// ==========================================
const rejectJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    const request = await JoinRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Admin can only reject requests
    // for their own apartment
    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.to(request.userId.toString()).emit("request_rejected", {
        message: "Your join request has been rejected by the admin.",
      });
    }

    await JoinRequest.findByIdAndDelete(requestId);

    res.json({
      message: "Request rejected successfully.",
    });
  } catch (error) {
    console.error("Reject join request error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// GET PENDING JOIN REQUESTS
// ADMIN ONLY
// GET /api/admin/join-requests
// ==========================================
const getPendingJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      apartmentId: req.user.apartmentId,
      status: "pending",
    }).populate("userId", "fullName email");

    res.json(requests);
  } catch (error) {
    console.error("Get pending requests error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================================
// APPROVE JOIN REQUEST
// ADMIN ONLY
// POST /api/admin/approve-join
// ==========================================
const approveJoinRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(requestId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        message: "Invalid request or user ID.",
      });
    }

    const joinRequest = await JoinRequest.findById(requestId);

    if (!joinRequest) {
      return res.status(404).json({
        message: "Join request not found.",
      });
    }

    // Request must belong to this admin's apartment
    if (joinRequest.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Make sure request actually belongs
    // to this user
    if (joinRequest.userId.toString() !== user._id.toString()) {
      return res.status(400).json({
        message: "Join request does not belong to this user.",
      });
    }

    user.apartmentId = req.user.apartmentId;

    user.isEvicted = false;

    await user.save();

    joinRequest.status = "approved";

    await joinRequest.save();

    // Notify user
    const io = req.app.get("io");

    if (io) {
      io.to(userId.toString()).emit("approval_confirmed", {
        message: "You have been approved!",
        apartmentId: req.user.apartmentId,
      });
    }

    res.json({
      message: "User approved successfully.",
    });
  } catch (error) {
    console.error("Approve join request error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadProfilePic,
  createApartment,
  getUserProfile,
  getMembers,
  removeUser,
  createJoinRequest,
  rejectJoinRequest,
  getPendingJoinRequests,
  approveJoinRequest,
  getMyApartment,
};
