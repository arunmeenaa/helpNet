const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  apartmentId: { type: String, required: true, unique: true }, // public ID
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Apartment", apartmentSchema);