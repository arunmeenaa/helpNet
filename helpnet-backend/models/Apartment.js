const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Public apartment/community ID
    apartmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    // User who created/owns the apartment
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Apartment || mongoose.model("Apartment", apartmentSchema);
