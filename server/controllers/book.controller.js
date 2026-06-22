const prisma = require("../prisma/client");
const s3 = require("../config/s3");
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
    let coverImageUrl = null;
    let ebookUrl = null;

    /*
    =====================================
    Upload Cover Image
    =====================================
    */
    if (req.files?.cover?.[0]) {
      const coverFile = req.files.cover[0];

      const safeFileName =
        coverFile.originalname.replace(/\s+/g, "-");

      const coverUpload = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `covers/${Date.now()}-${safeFileName}`,
        Body: coverFile.buffer,
        ContentType: coverFile.mimetype,
      }).promise();

      coverImageUrl = coverUpload.Location;
    }

    /*
    =====================================
    Upload Ebook
    =====================================
    */
    if (req.files?.ebook?.[0]) {
      const ebookFile = req.files.ebook[0];

      if (ebookFile.mimetype !== "application/pdf") {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed",
        });
      }

        const safeFileName =
          ebookFile.originalname.replace(/\s+/g, "-");

        const ebookUpload = await s3.upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `ebooks/${Date.now()}-${safeFileName}`,
          Body: ebookFile.buffer,
          ContentType: ebookFile.mimetype,
        }).promise();

      ebookUrl = ebookUpload.Location;
    }


  const book = await prisma.book.create({
    data: {
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      genre: genre.trim(),

      language: language?.trim() || null,
      publisher: publisher?.trim() || null,

      publishYear: publishYear
        ? Number(publishYear)
        : null,

      description: description?.trim() || null,

      totalCopies: copies,
      availableCopies: copies,

      coverImage: coverImageUrl,
      ebookUrl: ebookUrl,

      barcode: isbn.trim(),
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

    let coverImage = existingBook.coverImage;

    if (req.files?.cover?.[0]) {
      const coverFile = req.files.cover[0];

      if (existingBook.coverImage) {
        const oldCoverKey = decodeURIComponent(
          new URL(existingBook.coverImage).pathname.substring(1)
        ).replace(/\+/g, " ");

        await s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldCoverKey,
        }).promise();
      }

      const safeFileName =
        coverFile.originalname.replace(/\s+/g, "-");

      const coverUpload = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `covers/${Date.now()}-${safeFileName}`,
        Body: coverFile.buffer,
        ContentType: coverFile.mimetype,
      }).promise();

      coverImage = coverUpload.Location;
    }

    let ebookUrl = existingBook.ebookUrl;

    if (req.files?.ebook?.[0]) {
      const ebookFile = req.files.ebook[0];

      if (existingBook.ebookUrl) {
        const oldEbookKey = decodeURIComponent(
          new URL(existingBook.ebookUrl).pathname.substring(1)
        ).replace(/\+/g, " ");

        await s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldEbookKey,
        }).promise();
      }

      const safeFileName =
        ebookFile.originalname.replace(/\s+/g, "-");

      const ebookUpload = await s3.upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `ebooks/${Date.now()}-${safeFileName}`,
        Body: ebookFile.buffer,
        ContentType: ebookFile.mimetype,
      }).promise();

      ebookUrl = ebookUpload.Location;
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

        const borrowedCopies =
          existingBook.totalCopies -
          existingBook.availableCopies;

        if (
          req.body.totalCopies &&
          Number(req.body.totalCopies) < borrowedCopies
        ) {
          return res.status(400).json({
            success: false,
            message: `Cannot reduce total copies below ${borrowedCopies}. ${borrowedCopies} copies are currently borrowed.`,
          });
        }

        let availableCopies =
          existingBook.availableCopies;

        if (req.body.totalCopies) {
          const newTotalCopies =
            Number(req.body.totalCopies);

          const difference =
            newTotalCopies -
            existingBook.totalCopies;

          availableCopies =
            existingBook.availableCopies +
            difference;

          if (availableCopies < 0) {
            availableCopies = 0;
          }
        }        

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...req.body,

        publishYear: req.body.publishYear
          ? Number(req.body.publishYear)
          : null,

        totalCopies: req.body.totalCopies
          ? Number(req.body.totalCopies)
          : existingBook.totalCopies,

        availableCopies,

        coverImage,
        ebookUrl,
      },
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

    // Prevent deletion if active borrow exists
    const activeBorrows = book.borrows.filter(
      (borrow) => borrow.status === "active"
    );

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete book with active borrows",
      });
    }

    /*
    =====================================
    Delete Cover Image From S3
    =====================================
    */
    if (book.coverImage) {
      const coverKey = new URL(book.coverImage)
        .pathname
        .substring(1);

      await s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: coverKey,
      }).promise();

      
    }

    /*
    =====================================
    Delete Ebook From S3
    =====================================
    */
      if (book.ebookUrl) {

        

        const ebookKey = decodeURIComponent(
          new URL(book.ebookUrl).pathname.substring(1)
        );

      

        await s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: ebookKey,
        }).promise();

        
      }

    /*
    =====================================
    Delete Book Record
    =====================================
    */
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

/*
=====================================
Get Ebook URL
GET /api/books/:id/ebook
=====================================
*/
exports.getEbookUrl = async (req, res) => {
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

    if (!book.ebookUrl) {
      return res.status(404).json({
        success: false,
        message: "Ebook not available",
      });
    }

    

      const key = decodeURIComponent(
        new URL(book.ebookUrl).pathname.substring(1)
      ).replace(/\+/g, " ");



    const signedUrl = s3.getSignedUrl("getObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 60, // 1 hour
    });

    return res.status(200).json({
      success: true,
      ebookUrl: signedUrl,
    });
  } catch (error) {
    console.error("Get Ebook URL Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};