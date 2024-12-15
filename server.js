const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
console.log(process.env.MONGO_URI)
mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));

// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.get("/", (req, res) => {
    res.send("success")
})

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
