const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    apartmentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },


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
