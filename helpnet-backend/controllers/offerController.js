const mongoose = require("mongoose");
const Offer = require("../models/Offer");

const getAllOffers = async (req, res) => {
  try {
    if (!req.user.apartmentId) {
      return res.status(400).json({
        message: "Set apartment first",
      });
    }

    const offers = await Offer.find({
      apartmentId: req.user.apartmentId,
      status: {
        $nin: ["resolved", "cancelled"],
      },
    })
      .populate("author", "fullName")
      .sort({ createdAt: -1 });

    res.json(offers);
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

    if (offer.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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
    if (!req.user.apartmentId) {
      return res.status(400).json({
        message: "Set apartment first",
      });
    }

    const { title, description, location } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const newOffer = new Offer({
      title,
      description,
      location,
      author: req.user.id,
      apartmentId: req.user.apartmentId,
    });

    const savedOffer = await newOffer.save();

    const populatedOffer = await savedOffer.populate("author", "fullName");

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

    if (offer.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const allowedFields = ["title", "description", "location", "status"];

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

    if (offer.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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
    if (offer.apartmentId !== req.user.apartmentId) {
      return res.status(403).json({
        message: "Access denied",
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
