const prisma = require("../prisma/client");

/*
=====================================
Create Book
POST /api/books
=====================================
*/
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      genre,
      language,
      publisher,
      publishYear,
      description,
      totalCopies,
    } = req.body;

    // Required field validation
    if (!title || !author || !isbn || !genre) {
      return res.status(400).json({
        success: false,
        message: "Title, author, ISBN and genre are required",
      });
    }

    // Duplicate ISBN validation
    const existingBook = await prisma.book.findUnique({
      where: { isbn },
    });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "ISBN already exists",
      });
    }

    // Validate copies
    const copies = Math.max(Number(totalCopies) || 1, 1);

    // Validate publish year
    if (
      publishYear &&
      (Number(publishYear) < 1000 ||
        Number(publishYear) > new Date().getFullYear())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid publish year",
      });
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        isbn,
        genre,
        language,
        publisher,
        publishYear: publishYear ? Number(publishYear) : null,
        description,
        totalCopies: copies,
        availableCopies: copies,
        barcode: isbn,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    console.error("Create Book Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
Get All Books
GET /api/books
Supports:
?genre=
?language=
?publishYear=
?available=true
?sort=title|year|popular
=====================================
*/
exports.getBooks = async (req, res) => {
  try {
    const {
      genre,
      language,
      publishYear,
      available,
      sort,
    } = req.query;

    const filters = {};

    // Filters
    if (genre) {
      filters.genre = genre;
    }

    if (language) {
      filters.language = language;
    }

    if (publishYear) {
      filters.publishYear = Number(publishYear);
    }

    if (available === "true") {
      filters.availableCopies = {
        gt: 0,
      };
    }

    // Sorting
    let orderBy = {
      createdAt: "desc",
    };

    if (sort === "title") {
      orderBy = {
        title: "asc",
      };
    }

    if (sort === "year") {
      orderBy = {
        publishYear: "desc",
      };
    }

    if (sort === "popular") {
      orderBy = {
        timesBorrowed: "desc",
      };
    }

    const books = await prisma.book.findMany({
      where: filters,
      orderBy,
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Get Books Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
Get Single Book
GET /api/books/:id
=====================================
*/
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    console.error("Get Book Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
Update Book
PUT /api/books/:id
=====================================
*/
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Validate publish year
    if (
      req.body.publishYear &&
      (Number(req.body.publishYear) < 1000 ||
        Number(req.body.publishYear) > new Date().getFullYear())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid publish year",
      });
    }

    // Prevent negative copies
    if (
      req.body.totalCopies !== undefined &&
      Number(req.body.totalCopies) < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Total copies must be at least 1",
      });
    }

    if (
      req.body.availableCopies !== undefined &&
      Number(req.body.availableCopies) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Available copies cannot be negative",
      });
    }

    // Prevent invalid inventory state
    if (
      req.body.totalCopies !== undefined &&
      req.body.availableCopies !== undefined &&
      Number(req.body.availableCopies) >
        Number(req.body.totalCopies)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Available copies cannot exceed total copies",
      });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
Delete Book
DELETE /api/books/:id
=====================================
*/
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        borrows: true,
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const activeBorrows = book.borrows.filter(
      (borrow) => borrow.status === "active"
    );

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book with active borrows",
      });
    }

    await prisma.book.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
Search Books
GET /api/books/search?q=
=====================================
*/
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    const books = await prisma.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q || "",
              mode: "insensitive",
            },
          },
          {
            author: {
              contains: q || "",
              mode: "insensitive",
            },
          },
          {
            isbn: {
              contains: q || "",
              mode: "insensitive",
            },
          },
          {
            genre: {
              contains: q || "",
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error("Search Books Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};