const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");

// ==========================================
// GET ALL REQUESTS
// ==========================================
const getAllRequests = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user.id).lean();

    if (!user || !user.apartmentId) {
      return res.status(403).json({
        message: "You are no longer a member of an apartment community.",
      });
    }

    const requests = await Request.find({
      apartmentId: user.apartmentId,
      status: {
        $nin: ["resolved", "cancelled"],
      },
    })
      .populate("author", "fullName")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// GET MY REQUESTS
// ==========================================
const getMyRequests = async (req, res) => {
  try {
    // Verify current apartment membership
    const user = await User.findById(req.user.id).lean();

    if (!user || !user.apartmentId) {
      return res.status(403).json({
        message: "Access denied. No apartment assigned.",
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

// ==========================================
// GET SINGLE REQUEST
// ==========================================
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

    // Apartment-level access control
    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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

// ==========================================
// CREATE REQUEST
// ==========================================
const createRequest = async (req, res) => {
  try {
    const { title, description, location, priority } = req.body;

    // Get fresh user data
    const user = await User.findById(req.user.id).lean();

    if (!user || !user.apartmentId) {
      return res.status(403).json({
        message: "You must be in an apartment to post requests.",
      });
    }

    // Validate fields
    if (!title || !description || !location || !priority) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newRequest = new Request({
      title,
      description,
      location,
      priority,
      author: req.user.id,
      apartmentId: user.apartmentId,
    });

    const savedRequest = await newRequest.save();

    const populatedRequest = await savedRequest.populate("author", "fullName");

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// ==========================================
// UPDATE REQUEST STATUS
// ==========================================
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

    // Apartment access control
    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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

// ==========================================
// UPDATE REQUEST
// ==========================================
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

    // Apartment access control
    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "location",
      "priority",
      "status",
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

// ==========================================
// DELETE REQUEST
// ==========================================
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

    // Apartment access control
    if (request.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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
