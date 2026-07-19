const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({

    freeSampleEnabled: {
        type: Boolean,
        default: true
    },

    maxSamples: {
        type: Number,
        default: 1
    }

});

module.exports = mongoose.model("Settings", settingsSchema);