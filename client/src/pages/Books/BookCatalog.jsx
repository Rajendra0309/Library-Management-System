import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List as ListIcon, 
  BookOpen, 
  FilterX,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

const BookCatalog = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      setBooks(res.data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.includes(searchTerm);

    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    const matchesAvailability = !availableOnly || book.availableCopies > 0;

    return matchesSearch && matchesGenre && matchesAvailability;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setAvailableOnly(false);
  };

  const genres = ['Programming', 'Technology', 'Science', 'History', 'Business', 'Education', 'Fiction', 'Non-Fiction'];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in pb-10">
        <PageHeader 
          title="Book Catalog" 
          description="Manage and browse items in the collection."
        />
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-full md:w-1/3" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Book Catalog" 
        description={`Manage and browse ${filteredBooks.length} items in the collection.`}
        actions={
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-muted p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button asChild>
              <Link to="/books/add">
                <Plus className="mr-2 h-4 w-4" /> Add Book
              </Link>
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="bg-card p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-muted/50 border-transparent focus-visible:bg-transparent"
            placeholder="Search by title, author, or ISBN..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="flex h-10 w-[140px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All Genres</option>
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary transition-colors h-10 px-3 rounded-md hover:bg-muted">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary w-4 h-4"
            />
            Available Only
          </label>
          
          {(searchTerm || selectedGenre || availableOnly) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground ml-auto md:ml-0">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content View */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-dashed">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No books found</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-1 mb-6">
            We couldn't find any books matching your current filters. Try adjusting your search criteria.
          </p>
          <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="group bg-card rounded-xl border overflow-hidden flex flex-col hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div className="relative aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                )}
                
                {/* Overlay with View Action */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button asChild variant="secondary" className="shadow-lg font-semibold">
                    <Link to={`/books/${book.id}`}>View Details</Link>
                  </Button>
                </div>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm hover:bg-background border-transparent uppercase text-[10px] shadow-sm">
                    {book.genre}
                  </Badge>
                  <div 
                    className={`w-3 h-3 rounded-full border-2 border-background shadow-sm ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    title={book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                  />
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">{book.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-4">{book.author}</p>
                
                <div className="mt-auto pt-3 border-t flex flex-wrap gap-2 justify-between items-center text-xs text-muted-foreground font-mono">
                  <span className="truncate max-w-[120px]" title={book.isbn}>ISBN {book.isbn}</span>
                  <span className={`whitespace-nowrap ${book.availableCopies > 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}`}>
                    {book.availableCopies} available
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="py-3 px-4 font-medium text-muted-foreground">Book</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">Genre</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground">ISBN</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground text-right">Status</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-muted rounded flex items-center justify-center shrink-0 overflow-hidden">
                          {book.coverImage ? (
                            <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{book.title}</p>
                          <p className="text-muted-foreground">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="uppercase text-[10px]">{book.genre}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {book.isbn}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {book.availableCopies > 0 ? (
                        <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                          {book.availableCopies} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-600 dark:text-rose-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                          Unavailable
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/books/${book.id}`}>Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination removed as requested */}
    </div>
  );
};

export default BookCatalog;
