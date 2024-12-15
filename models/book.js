const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publisher: { type: String, required: true },
    exam: { type: String, required: false },
    subject: { type: String, required: false },
    description: { type: String, required: false },
    price: { type: Number, required: false },
    language: { type: String, required: false },
    isbn: { type: String, required: true, unique: true },
    publicationDate: { type: Date, required: false },
    qrCode: { type: String, required: false },
    addedDate: { type: Date }
});

module.exports = mongoose.model('Book', BookSchema);
