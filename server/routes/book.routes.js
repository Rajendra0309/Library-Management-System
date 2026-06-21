const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
  getEbookUrl,
} = require("../controllers/book.controller");

const {
  protect,
  authorize,
} = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

/*
=====================================
Search Books
Members + Librarians + Admins
GET /api/books/search
=====================================
*/
router.get(
  "/search",
  protect,
  searchBooks
);

/*
=====================================
Get Ebook (Pre-Signed URL)
Members + Librarians + Admins
GET /api/books/:id/ebook
=====================================
*/
router.get(
  "/:id/ebook",
  protect,
  getEbookUrl
);

/*
=====================================
Get All Books
Members + Librarians + Admins
GET /api/books
=====================================
*/
router.get(
  "/",
  protect,
  getBooks
);

/*
=====================================
Get Single Book
Members + Librarians + Admins
GET /api/books/:id
=====================================
*/
router.get(
  "/:id",
  protect,
  getBookById
);

/*
=====================================
Create Book
Admin + Librarian Only
POST /api/books
=====================================
*/
router.post(
  "/",
  protect,
  authorize("admin", "librarian"),
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "ebook", maxCount: 1 }
  ]),
  createBook
);

/*
=====================================
Update Book
Admin + Librarian Only
PUT /api/books/:id
=====================================
*/
router.put(
  "/:id",
  protect,
  authorize("admin", "librarian"),
  updateBook
);

/*
=====================================
Delete Book
Admin + Librarian Only
DELETE /api/books/:id
=====================================
*/
router.delete(
  "/:id",
  protect,
  authorize("admin", "librarian"),
  deleteBook
);

module.exports = router;