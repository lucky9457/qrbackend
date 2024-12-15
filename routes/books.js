const express = require('express');
const QRCode = require('qrcode');
const Book = require('../models/book');
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

// Get book details by ID or ISBN
router.get('/detail/:idOrIsbn', authenticate, async (req, res) => {
    const { idOrIsbn } = req.params;

    try {
        // Check if the identifier is an ISBN or MongoDB ObjectId
        const query = idOrIsbn.match(/^[0-9]+$/)
            ? { isbn: idOrIsbn } // Query by ISBN if it's numeric
            : { _id: idOrIsbn }; // Otherwise, query by MongoDB ObjectId

        // Fetch the book details from the database
        const book = await Book.findOne(query);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Return the book details
        res.status(200).json(book);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching book details');
    }
});
router.delete('/delete/:id', authenticate, async (req, res) => {
    const { id } = req.params;

    try {
        const book = await Book.findByIdAndDelete(id);

        if (!book) {
            return res.status(404).send('Book not found');
        }

        res.status(200).send('Book deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting book');
    }
});

// Edit book details
router.put('/edit/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const updatedDetails = req.body;

    try {
        // Check if the book exists
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        // Update QR Code if certain fields are changed
        const fieldsForQRCode = [
            'title',
            'author',
            'publisher',
            'exam',
            'subject',
            'description',
            'price',
            'language',
            'isbn',
            'publicationDate'
        ];
        const shouldUpdateQRCode = Object.keys(updatedDetails).some(field =>
            fieldsForQRCode.includes(field)
        );

        if (shouldUpdateQRCode) {
            const qrData = JSON.stringify({ ...book.toObject(), ...updatedDetails });
            updatedDetails.qrCode = await QRCode.toDataURL(qrData);
        }

        // Update book details
        const updatedBook = await Book.findByIdAndUpdate(id, updatedDetails, { new: true });

        res.status(200).json(updatedBook);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error editing book');
    }
});



module.exports = router;
