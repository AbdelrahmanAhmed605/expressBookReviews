const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//returns boolean to check is the username & password are valid
const isValid = (username)=>{ 
}

//check if username and password match the one we have in records.
const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
    }
    
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
          data: password
        }, 'access', { expiresIn: 60 * 60 });
    
        req.session.authorization = {
          accessToken,username
      }
      return res.status(200).send("User successfully logged in");
      } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
      }
});

// Add/update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const book = books[isbn];
  
    if (!book) {
      res.status(404).send("Book not found");
      return;
    }
  
    const bookReviews = book.reviews || {};
    const username = req.session.authorization.username;

    // Update or add the review for the specified username
    bookReviews[username] = review;

    res.status(200).send({"message":`The review for the book with ISBN ${isbn} has been added/updated`, bookReviews});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        res.status(404).send("Book not found");
        return;
    }
    
    const bookReviews = book.reviews || {};
    const username = req.session.authorization.username;

    if(bookReviews[username]){
        delete bookReviews[username];
        return res.status(200).send({"message":`The review for the book with ISBN ${isbn} has been deleted`, bookReviews});
    }
    else{
        return res.status(404).send("No reviews found");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
