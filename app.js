import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Database } from 'simple-json-db';

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database (JSON file)
const db = new Database('books.json');
const booksDB = db.JSON();


// Get all books
app.get('/books',authenticateUser, (req, res) => {
    res.json(booksDB);
  });
  
  // Get a specific book by bookId
  app.get('/books/:bookId',authenticateUser, (req, res) => {
    const bookId = req.params.bookId;
    const book = booksDB.find((book) => book.id === bookId);
  
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    res.json(book);
  });
  
  // Create a new book
  app.post('/books',authenticateUser, (req, res) => {
    const { title, author, year } = req.body;
    const newBook = { id: String(booksDB.length + 1), title, author, year };
  
    booksDB.push(newBook);
  
    res.status(201).json(newBook);
  });
  
  // Update an existing book by bookId
  app.put('/books/:bookId',authenticateUser, (req, res) => {
    const bookId = req.params.bookId;
    const { title, author, year } = req.body;
    const bookIndex = booksDB.findIndex((book) => book.id === bookId);
  
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    const updatedBook = { ...booksDB[bookIndex], title, author, year };
    booksDB[bookIndex] = updatedBook;
  
    res.json(updatedBook);
  });
  
  // Delete a book by bookId
  app.delete('/books/:bookId',authenticateUser, (req, res) => {
    const bookId = req.params.bookId;
    const bookIndex = booksDB.findIndex((book) => book.id === bookId);
  
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }
  
    booksDB.splice(bookIndex, 1);
  
    res.json({ message: 'Book deleted successfully' });
  });
  

// Dummy users data for authentication
const usersDB = [
    { id: '1', username: 'user1', password: 'password1', accessToken: 'token1' },
    { id: '2', username: 'user2', password: 'password2', accessToken: 'token2' },
  ];
  
  // Middleware for checking if the user is authorized
  const authenticateUser = (req, res, next) => {
    const accessToken = req.headers.authorization;
  
    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    const user = usersDB.find((user) => user.accessToken === accessToken);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
  
    req.user = user;
    next();
  };
  
  // Authentication endpoint (Login)
  app.post('/auth', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find((user) => user.username === username && user.password === password);
  
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  
    res.json({ accessToken: user.accessToken });
  });
  
  // Registration endpoint
  app.post('/register', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the username is already taken
    if (usersDB.some((user) => user.username === username)) {
      return res.status(409).json({ message: 'Username already taken' });
    }
  
    const newUser = { id: String(usersDB.length + 1), username, password, accessToken: `token${usersDB.length + 1}` };
    usersDB.push(newUser);
  
    res.status(201).json({ accessToken: newUser.accessToken });
  });  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
