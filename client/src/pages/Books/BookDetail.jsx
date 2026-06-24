import React, { useEffect, useState } from 'react';
import { Link,useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import PdfViewer from '../../components/PdfViewer';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ebookUrl, setEbookUrl] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
 
  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data.data);
    } catch (error) {
      console.error("Error fetching book:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadEbook = async () => {
    try {
      const res = await api.get(`/books/${id}/ebook`);
      setEbookUrl(res.data.ebookUrl);
      setShowPdfViewer(true);
    } catch (error) {
      alert("Ebook not available");
    }
  };

    const handleDelete = async () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this book?"
      );

      if (!confirmed) return;

      try {
        const res = await api.delete(`/books/${id}`);

        if (res.data.success) {
          navigate("/books");
          return;
        }
      } catch (error) {
        console.error(error);

        alert(
          error.response?.data?.message ||
          "Failed to delete book"
        );
      }
    };

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!book) {
    return <div className="p-10">Book not found</div>;
  }  

  return (
    <div className="flex-1 p-lg md:p-page-padding max-w-content-max-width mx-auto w-full pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center gap-sm mb-xl text-text-secondary font-body-sm text-body-sm">
        <Link to="/books" className="hover:text-primary transition-colors flex items-center gap-xs">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Inventory
        </Link>
        <span className="text-border-default">|</span>
        <span className="text-on-surface">Book Details</span>
      </div>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4xl items-start">
        {/* Left Column (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-xl">
          {/* Cover Card */}
          <div className="bg-surface rounded-xl shadow-sm p-md relative group hover:-translate-y-[3px] hover:shadow-md transition-all border border-transparent hover:border-border-default">
            {book.ebookUrl && (
            <div className="absolute top-xl right-xl z-10 flex flex-col gap-sm">
              <span className="bg-primary text-on-primary font-label-xs text-label-xs uppercase tracking-widest px-md py-base rounded-full shadow-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[14px]">tablet_mac</span> E-Book
              </span>
            </div>
            )}
            <div className="aspect-[3/4] w-full bg-surface-container-low rounded-lg overflow-hidden relative border border-border-subtle">
              {book.coverImage ? (
                <img onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover" src={book.coverImage} alt={`Cover for ${book.title}`} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                   <span className="material-symbols-outlined text-outline-variant text-6xl">menu_book</span>
                </div>
              )}
            </div>
          </div>

          {/* Barcode/Scan Card */}
          <div className="bg-surface rounded-xl shadow-sm p-card-padding flex flex-col items-center justify-center gap-md border border-border-subtle">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Inventory Barcode</span>
            <div className="w-full h-16 bg-[repeating-linear-gradient(90deg,#141b2b_0,#141b2b_2px,transparent_2px,transparent_6px,#141b2b_6px,#141b2b_10px,transparent_10px,transparent_14px)] opacity-80 mix-blend-multiply"></div>
            <span className="font-code-mono text-code-mono text-on-surface tracking-widest">{book.isbn}</span>
          </div>
        </div>

        {/* Right Column (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-4xl">
          {/* Header Info */}
          <div className="flex flex-col gap-md">
            <div className="flex items-start justify-between gap-xl">
              <div>
                <h1 className="font-headline-2xl text-headline-2xl text-on-surface mb-xs">{book.title}</h1>
                <p className="font-body-base text-body-base text-text-secondary">by {book.author}</p>
              </div>
                <span
                  className={`${
                    book.availableCopies > 0
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-error text-on-error'
                  } font-label-xs text-label-xs uppercase tracking-widest px-md py-sm rounded-full flex items-center gap-xs whitespace-nowrap`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {book.availableCopies > 0 ? 'check_circle' : 'cancel'}
                  </span>
                  {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                </span>
            </div>

            {/* Genres */}
              <div className="flex flex-wrap gap-sm mt-sm">
                <span className="px-md py-base bg-surface-variant text-on-surface-variant rounded-full font-label-xs text-label-xs uppercase tracking-widest">
                  {book.genre}
                </span>
              </div>
          </div>

          {/* Availability Progress */}
          <div className="bg-surface rounded-xl shadow-sm p-card-padding border border-border-subtle flex flex-col gap-md">
            <div className="flex justify-between items-end">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Circulation Status</span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold">{book.availableCopies} of {book.totalCopies} Copies Available</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
              <div 
                className={`${book.availableCopies > 0 ? 'bg-tertiary-container' : 'bg-error'} h-full rounded-full transition-all`} 
                style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="bg-surface rounded-xl shadow-sm p-card-padding border border-border-subtle grid grid-cols-2 md:grid-cols-3 gap-y-xl gap-x-md">
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">ISBN-13</span>
              <span className="font-code-mono text-code-mono text-on-surface">{book.isbn}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Publisher</span>
              <span className="font-body-base text-body-base text-on-surface">{book.publisher}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Language</span>
              <span className="font-body-base text-body-base text-on-surface">{book.language}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Publication Year</span>
              <span className="font-body-base text-body-base text-on-surface">{book.publishYear}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Format</span>
              <span className="font-body-base text-body-base text-on-surface">{book.ebookUrl? "Physical + E-Book": "Physical Copy"}</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Times Borrowed</span>
              <span className="font-body-base text-body-base text-on-surface">{book.timesBorrowed}</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-sm">
            <span className="font-label-xs text-label-xs text-text-secondary uppercase tracking-widest">Description</span>
            <div className="relative">
              <p className="font-body-base text-body-base text-on-surface leading-relaxed text-opacity-90">
                {book.description}
              </p>
              <button className="text-primary font-body-sm text-body-sm font-semibold hover:underline mt-sm">Read More</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-md pt-xl border-t border-border-subtle">
            <button
              onClick={handleReadEbook}
              disabled={!book.ebookUrl}
              className="bg-brand-gradient text-on-primary font-body-base text-body-base px-3xl py-md rounded-lg shadow-sm hover:-translate-y-[2px] hover:shadow-brand-glow transition-all flex items-center gap-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="material-symbols-outlined">library_add_check</span>
              {book.ebookUrl ? "Read Ebook" : "Ebook Not Available"}
            </button>
            <button className="border border-border-default text-primary font-body-base text-body-base px-3xl py-md rounded-lg hover:bg-bg-hover transition-colors flex items-center gap-sm">
              <span className="material-symbols-outlined">bookmark_add</span>
              Reserve
            </button>
            <div className="flex-1"></div>
            <Link
              to={`/books/edit/${book.id}`}
              className="p-sm text-text-secondary border border-border-default rounded-lg hover:bg-bg-hover hover:text-on-surface transition-colors"
              title="Edit Record"
            >
              <span className="material-symbols-outlined">edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="p-sm text-error border border-error-container bg-error-container/20 rounded-lg hover:bg-error-container transition-colors"
              title="Delete Record"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reservation Queue Table */}
      <div className="mt-4xl bg-surface rounded-xl shadow-sm border border-border-subtle overflow-hidden">
        <div className="p-card-padding border-b border-border-subtle flex justify-between items-center bg-surface-bright">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Reservation Queue</h2>
          <span className="bg-surface-variant text-on-surface-variant font-label-xs text-label-xs px-md py-base rounded-full">1 Waiting</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-label-xs text-label-xs uppercase tracking-widest text-text-secondary px-card-padding py-md border-b border-border-subtle">Position</th>
                <th className="font-label-xs text-label-xs uppercase tracking-widest text-text-secondary px-card-padding py-md border-b border-border-subtle">Member Name</th>
                <th className="font-label-xs text-label-xs uppercase tracking-widest text-text-secondary px-card-padding py-md border-b border-border-subtle">Member ID</th>
                <th className="font-label-xs text-label-xs uppercase tracking-widest text-text-secondary px-card-padding py-md border-b border-border-subtle">Date Requested</th>
                <th className="font-label-xs text-label-xs uppercase tracking-widest text-text-secondary px-card-padding py-md border-b border-border-subtle text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-bg-hover transition-colors h-[48px] border-b border-border-subtle last:border-0">
                <td className="px-card-padding py-sm font-body-sm text-body-sm text-on-surface">
                  <span className="bg-primary-container text-on-primary-container w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                </td>
                <td className="px-card-padding py-sm font-body-sm text-body-sm text-on-surface font-semibold">Eleanor Vance</td>
                <td className="px-card-padding py-sm font-code-mono text-code-mono text-text-secondary">MBR-8492</td>
                <td className="px-card-padding py-sm font-body-sm text-body-sm text-text-secondary">Oct 24, 2023</td>
                <td className="px-card-padding py-sm text-right">
                  <button className="text-primary hover:text-primary-container font-body-sm text-body-sm font-semibold">Notify</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showPdfViewer && ebookUrl && (
        <PdfViewer url={ebookUrl} title={book.title} onClose={() => setShowPdfViewer(false)} />
      )}
    </div>
  );
};

export default BookDetail;
