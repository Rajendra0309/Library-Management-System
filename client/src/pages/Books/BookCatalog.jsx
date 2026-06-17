import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_BOOKS = [
  {
    id: 1,
    title: "The Design of Everyday Things",
    author: "Don Norman",
    isbn: "9780465050659",
    genre: "Design",
    status: "Available",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1CSUvft2_Dvtp67w8E2jg_Fzdy2OyawdIbWqS0aooK-l3HB2nDdMYrzmnicBo0tkXhCfyl2wlz6DepqKRxG3h4u3DrjrULhJkINe0Q1LDYEy0HCSy9TUKtlQowwoBxatpHNWa6SsImPoCxLIiymFW7r5q1WaXZiG3qnKUvVmp4GkME2kDXS53rckU-Ri07xeNElONc2cMuZvQYfGiP3jI-txblglLyNaZxPaQNuNib4XSTA7QxL5F4PGVXyvJciwMfkOW-R9oOkY"
  },
  {
    id: 2,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "9780316769488",
    genre: "Fiction",
    status: "Borrowed",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDQTbg4qBDGXFqhJt-BSm6-pFRUPkljvAwu_wi2rqwq8-VMRdQsmjyBovRYEk36hmiGJqcrPaz7ushis_wxrfLyVZcQEQsHOVWnz3yzmUKGn-Bu0IiqCFQJ1FWFv5icFkpedqui4wGxXDPZIwD9fVvkZbL26_trUTsqfU3oqYhgh_o5Ty2ZQ7zQGNzC1AEygGUOrBDMhLHsDipjOVHt3MOs4qJc2O_wr8_rphZoFkKFiYr7pNqsMa5VXQhQ7nWz61v67N18RgLsAn8"
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    genre: "Science",
    status: "Available",
    coverUrl: null
  },
  {
    id: 4,
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    genre: "History",
    status: "Available",
    coverUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMin3jV_5xdY66dzM52fGfSmU82dUSoTAYGnf8rlWMpj8W2Aiq0cC6hPMcR50HckbNKN_1JtYXmO1oQi4OqbW3J33J605zg9kDmMUQm4X5wFwwxqwtzxQWVim-152aP9HRAWxOxlZyWhpBIkk-rP9933EL-J-892Pg_mqdT4-kLIweEwgCmiCi9ozzyExkPT61hW21OZc-WHU1Tmqmzfe0plhJFBVOxUc_aYn1vby9cY121y7Wcdd2-TKlK6lm7rsncQzBXPnwS2Y"
  }
];

const BookCatalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  
  return (
    <div className="max-w-content-max-width mx-auto px-page-padding py-4xl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4xl">
        <div>
          <h1 className="font-display-3xl text-display-3xl text-on-surface mb-2">Book Catalog</h1>
          <p className="font-body-base text-body-base text-text-secondary">Manage and browse 12,458 items in the collection.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-surface rounded-lg p-1 border border-border-default shadow-sm hidden md:flex">
            <button 
              onClick={() => setViewMode('grid')}
              aria-label="Grid View" 
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-bg-hover text-primary shadow-sm' : 'text-text-tertiary hover:text-on-surface hover:bg-bg-hover'} transition-colors`}
            >
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              aria-label="List View" 
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-bg-hover text-primary shadow-sm' : 'text-text-tertiary hover:text-on-surface hover:bg-bg-hover'} transition-colors`}
            >
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-body-sm text-body-sm font-semibold hover:shadow-brand-glow active:scale-[0.97] transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            Add Book
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface p-card-padding rounded-xl shadow-sm border border-border-subtle mb-4xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-surface-bright border border-border-default rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-focus-ring transition-shadow" 
            placeholder="Search by title, author, or ISBN..." 
            type="text"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select className="bg-surface-bright border border-border-default rounded-lg px-4 py-2 font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">
            <option value="">All Genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="history">History</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input className="form-checkbox rounded text-primary border-border-default focus:ring-focus-ring" type="checkbox"/>
            <span className="font-body-sm text-body-sm text-on-surface">Available Now</span>
          </label>
          <button className="text-text-secondary hover:text-primary font-body-sm text-body-sm transition-colors ml-auto md:ml-0">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-xl mb-4xl">
        {MOCK_BOOKS.map((book) => (
          <div key={book.id} className="bg-bg-surface rounded-[14px] border border-border-subtle overflow-hidden relative group hover:-translate-y-1 hover:border-border-default hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <div className={`aspect-[3/4] bg-surface-variant relative overflow-hidden ${!book.coverUrl ? 'flex items-center justify-center' : ''}`}>
              {book.coverUrl ? (
                <img alt={`Book cover for ${book.title}`} className="w-full h-full object-cover" src={book.coverUrl} />
              ) : (
                <span className="material-symbols-outlined text-outline-variant text-6xl">menu_book</span>
              )}
              <div className="absolute inset-0 bg-inverse-surface/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Link to={`/books/${book.id}`} className="bg-surface text-primary font-body-sm text-body-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-bg-hover transition-colors">
                  View Details
                </Link>
              </div>
            </div>
            
            <div className="p-card-padding flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="bg-surface-container-high text-on-surface font-label-xs text-label-xs px-2 py-1 rounded-full uppercase">{book.genre}</span>
                <span 
                  className={`w-2 h-2 rounded-full ${book.status === 'Available' ? 'bg-tertiary-fixed-dim' : 'bg-error'}`} 
                  title={book.status}
                ></span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-1 line-clamp-2">{book.title}</h3>
              <p className="font-body-sm text-body-sm text-text-secondary mb-4 line-clamp-1">{book.author}</p>
              
              <div className="mt-auto flex justify-between items-center border-t border-border-subtle pt-3">
                <span className="font-code-mono text-code-mono text-text-tertiary text-[12px]">ISBN {book.isbn}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4xl">
        <button className="p-2 rounded-lg border border-border-default text-text-secondary hover:bg-bg-hover disabled:opacity-50 transition-colors" disabled>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg bg-primary text-white font-body-sm text-body-sm flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-lg text-on-surface hover:bg-bg-hover font-body-sm text-body-sm flex items-center justify-center transition-colors">2</button>
          <button className="w-8 h-8 rounded-lg text-on-surface hover:bg-bg-hover font-body-sm text-body-sm flex items-center justify-center transition-colors">3</button>
          <span className="text-text-tertiary">...</span>
          <button className="w-8 h-8 rounded-lg text-on-surface hover:bg-bg-hover font-body-sm text-body-sm flex items-center justify-center transition-colors">124</button>
        </div>
        <button className="p-2 rounded-lg border border-border-default text-text-secondary hover:bg-bg-hover transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default BookCatalog;
