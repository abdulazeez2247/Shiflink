const { geocodeAddress } = require("../config/googleMap");
const Shift = require("../models/Shift");
const createError = require("http-errors");

const validateShiftLocation = async (shiftId, address) => {
  try {
    const { lat, lng } = await geocodeAddress(address);

    return Shift.findByIdAndUpdate(
      shiftId,
      { locationCoords: { type: "Point", coordinates: [lng, lat] } },
      { new: true }
    );
  } catch (err) {
    throw createError(400, "Invalid shift location", { originalError: err });
  }
};

module.exports = { validateShiftLocation };
