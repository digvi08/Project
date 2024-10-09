const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    fruitType: { type: String, required: true },
    uploadedImage: { type: String, required: true },
    matchedImage: { type: String, required: true },
    similarity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
