const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookDatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define MongoDB schemas and models
const buySchema = new mongoose.Schema({
  borrowerName: String,
  bookName: String,
  purchaseDateTime: Date,
});
const Buy = mongoose.model('Buy', buySchema, 'buys');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  image: String,
});
const Book = mongoose.model('Book', bookSchema);

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Wj28@krhps',
  database: 'bookDatabase',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL Database');
  }
});

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    res.redirect('/index');
  } else {
    res.send('Invalid credentials. Please try again.');
  }
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/lender-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lender-dashboard.html'));
});

app.get('/borrower-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'borrower-dashboard.html'));
});

// Handle book upload with an image (MongoDB)
app.post('/upload', upload.single('bookImage'), (req, res) => {
  const { title, author } = req.body;
  const image = req.file.path;

  const newBook = new Book({ title, author, image });
  newBook.save()
    .then(() => res.status(201).send('Book uploaded successfully'))
    .catch((err) => res.status(500).send('Error uploading book'));
});

// Handle book purchase (MongoDB and MySQL)
app.post('/buy', async (req, res) => {
  const { borrowerName, bookName, purchaseDateTime } = req.body;

  try {
    // Save to MongoDB
    const newBuy = new Buy({ borrowerName, bookName, purchaseDateTime });
    await newBuy.save();
    console.log('Data saved to MongoDB');

    // Save to MySQL
    const sql = 'INSERT INTO buys (borrowerName, bookName, purchaseDateTime) VALUES (?, ?, ?)';
    db.query(sql, [borrowerName, bookName, purchaseDateTime], (err) => {
      if (err) {
        console.error('MySQL Error:', err);
        return res.status(500).send('Error saving to MySQL');
      }
      console.log('Data saved to MySQL');
    });

    res.status(200).send('Data saved successfully to both databases');
  } catch (error) {
    console.error('Error saving purchase:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search Books (MongoDB)
app.get('/search-books', async (req, res) => {
  const { query } = req.query;
  try {
    const books = await Book.find({ title: { $regex: query, $options: 'i' } });
    res.json(books);
  } catch (err) {
    console.error('Error searching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Import profile routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api', profileRoutes);

app.get('/search-purchase', async (req, res) => {
  const { borrowerName } = req.query;

  try {
    const purchases = await Buy.find({ borrowerName: { $regex: borrowerName, $options: 'i' } });
    
    if (purchases.length === 0) {
      return res.status(404).json({ message: 'No purchases found for this borrower.' });
    }
    
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchase data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
