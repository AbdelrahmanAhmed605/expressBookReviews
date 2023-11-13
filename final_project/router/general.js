const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


//Function to check if the user exists
const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!doesExist(username)) { 
        users.push({"username":username,"password":password});
        return res.status(201).json({message: "Customer successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// Simulating an asynchronous data retrieval with a Promise
const getBooks = () => {
    return new Promise((resolve) => {
      // Simulating an asynchronous operation
      setTimeout(() => {
        resolve(books);
      }, 1000);
    });
  };

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    getBooks()
        .then((data) => {
            res.status(200).json(data);
        })
        .catch((error) => {
            console.error('Error retrieving books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    getBooks()
        .then((data) => {
        const isbnBook = data[isbn];
        if (isbnBook) {
            res.status(200).json(isbnBook);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
        })
        .catch((error) => {
            console.error('Error retrieving books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    getBooks()
        .then((data) => {
        const booksByAuthor = [];
        for (let [isbn, book] of Object.entries(data)) {
            if (book.author == author) {
            booksByAuthor.push({
                $isbn: isbn,
                title: book.title,
                reviews: book.reviews,
            });
            }
        }
        res.status(200).json({ booksByAuthor });
        })
        .catch((error) => {
            console.error('Error retrieving books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    getBooks()
        .then((data) => {
        const booksByTitle = [];
        for (let [isbn, book] of Object.entries(data)) {
            if (book.title == title) {
            booksByTitle.push({
                $isbn: isbn,
                author: book.author,
                reviews: book.reviews,
            });
            }
        }
        res.status(200).json({ booksByTitle });
        })
        .catch((error) => {
            console.error('Error retrieving books:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
