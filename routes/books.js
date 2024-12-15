const express = require('express');
const QRCode = require('qrcode');
const Book = require('../models/Book');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Add a new book
router.post('/add', authenticate, async (req, res) => {
    const {
        title,
        author,
        publisher,
        exam,
        subject,
        description,
        price,
        language,
        isbn,
        publicationDate
    } = req.body;

    try {
        // Validate required fields
        if (!title || !author || !publisher || !isbn) {
            return res.status(400).send('Title, author, publisher, and ISBN are required.');
        }

        // Generate QR code based on title and ISBN
        const qrData = JSON.stringify({
            title,
            author,
            publisher,
            exam,
            subject,
            description,
            price,
            language,
            isbn,
            publicationDate
        });
        const qrCode = await QRCode.toDataURL(qrData);

        // Create a new book entry
        const book = new Book({
            title,
            author,
            publisher,
            exam,
            subject,
            description,
            price,
            language,
            isbn,
            publicationDate,
            qrCode,
            addedDate: new Date() // Add the current date
        });

        // Save to database
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding book');
    }
});

// Get all books
router.get('/', authenticate, async (req, res) => {
    try {
        // Fetch all books from the database
        const books = await Book.find();
        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books');
    }
});

// Sort books by date or name
router.get('/sort', authenticate, async (req, res) => {
    const { sortBy, order } = req.query; // "sortBy" can be "addedDate" or "title", "order" can be "asc" or "desc"

    try {
        if (!['addedDate', 'title'].includes(sortBy)) {
            return res.status(400).send('Invalid sort field');
        }

        if (!['asc', 'desc'].includes(order)) {
            return res.status(400).send('Invalid sort order');
        }

        // Fetch and sort books from the database
        const books = await Book.find().sort({ [sortBy]: order === 'asc' ? 1 : -1 });
        res.status(200).json(books);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sorting books');
    }
});

module.exports = router;
