// Version 1: book.routes.js (Without Authentication)

const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
} = require("../controllers/book.controller");

/*
=====================================
Search Routes
=====================================
*/
router.get("/search", searchBooks);

/*
=====================================
CRUD Routes
=====================================
*/
router.post("/", createBook);

router.get("/", getBooks);

router.get("/:id", getBookById);

router.put("/:id", updateBook);

router.delete("/:id", deleteBook);

module.exports = router;


// Version 2: book.routes.js (With Authentication)

// const express = require("express");
// const router = express.Router();

// const {
//   createBook,
//   getBooks,
//   getBookById,
//   updateBook,
//   deleteBook,
//   searchBooks,
// } = require("../controllers/book.controller");

// const {
//   protect,
//   authorize,
// } = require("../middleware/auth.middleware");

// /*
// =====================================
// Search Routes
// Members + Librarians + Admins
// =====================================
// */
// router.get(
//   "/search",
//   protect,
//   searchBooks
// );

// /*
// =====================================
// Read Routes
// Members + Librarians + Admins
// =====================================
// */
// router.get(
//   "/",
//   protect,
//   getBooks
// );

// router.get(
//   "/:id",
//   protect,
//   getBookById
// );

// /*
// =====================================
// Create Route
// Admin + Librarian
// =====================================
// */
// router.post(
//   "/",
//   protect,
//   authorize("admin", "librarian"),
//   createBook
// );

// /*
// =====================================
// Update Route
// Admin + Librarian
// =====================================
// */
// router.put(
//   "/:id",
//   protect,
//   authorize("admin", "librarian"),
//   updateBook
// );

// /*
// =====================================
// Delete Route
// Admin + Librarian
// =====================================
// */
// router.delete(
//   "/:id",
//   protect,
//   authorize("admin", "librarian"),
//   deleteBook
// );

// module.exports = router;