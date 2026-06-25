import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import PdfViewer from '../../components/PdfViewer';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { 
  ArrowLeft, 
  BookOpen, 
  Tablet, 
  CheckCircle2, 
  XCircle, 
  BookmarkPlus, 
  Edit, 
  Trash2,
  Users
} from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
    const confirmed = window.confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;

    try {
      const res = await api.delete(`/books/${id}`);
      if (res.data.success) {
        navigate("/books");
        return;
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete book");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in pb-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Book Not Found</h2>
        <p className="text-muted-foreground mb-6">The book you are looking for does not exist or has been removed.</p>
        <Button asChild><Link to="/books">Return to Inventory</Link></Button>
      </div>
    );
  }  

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-6xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/books')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader 
            title="Book Details" 
            description="View and manage detailed information."
            className="mb-0"
          />
        </div>
        <div className="flex gap-2">
          {user?.role !== 'member' && (
            <>
              <Button variant="outline" size="icon" asChild title="Edit Record">
                <Link to={`/books/edit/${book.id}`}><Edit className="h-4 w-4" /></Link>
              </Button>
              <Button variant="destructive" size="icon" onClick={handleDelete} title="Delete Record">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Images & Barcode) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Cover Card */}
          <Card className="overflow-hidden border-2 border-muted hover:border-primary/20 transition-colors">
            <div className="relative aspect-[3/4] w-full bg-muted flex items-center justify-center group">
              {book.ebookUrl && (
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="default" className="shadow-md flex items-center gap-1.5 py-1">
                    <Tablet className="w-3.5 h-3.5" /> E-Book
                  </Badge>
                </div>
              )}
              {book.coverImage ? (
                <img onContextMenu={(e) => e.preventDefault()} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={book.coverImage} alt={`Cover for ${book.title}`} />
              ) : (
                <BookOpen className="h-20 w-20 text-muted-foreground/30" />
              )}
            </div>
          </Card>

          {/* Barcode/Scan Card */}
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center gap-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Inventory Barcode</span>
              <div className="w-full h-16 bg-[repeating-linear-gradient(90deg,currentColor_0,currentColor_2px,transparent_2px,transparent_6px,currentColor_6px,currentColor_10px,transparent_10px,transparent_14px)] opacity-20"></div>
              <span className="font-mono font-medium tracking-widest">{book.isbn}</span>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Details) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1 leading-tight">{book.title}</h1>
                  <p className="text-lg text-muted-foreground">by {book.author}</p>
                </div>
                <Badge variant={book.availableCopies > 0 ? "secondary" : "destructive"} className={`whitespace-nowrap px-3 py-1 text-sm flex items-center gap-1.5 ${book.availableCopies > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}>
                  {book.availableCopies > 0 ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {book.availableCopies > 0 ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="outline" className="uppercase text-[10px] tracking-wider bg-muted/50">{book.genre}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ISBN-13</p>
                  <p className="font-mono font-medium">{book.isbn}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publisher</p>
                  <p className="font-medium">{book.publisher}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Language</p>
                  <p className="font-medium">{book.language}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publication Year</p>
                  <p className="font-medium">{book.publishYear}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format</p>
                  <p className="font-medium">{book.ebookUrl ? "Physical + E-Book" : "Physical Copy"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Times Borrowed</p>
                  <p className="font-medium">{book.timesBorrowed || 0}</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                <p className="text-sm md:text-base leading-relaxed text-foreground/90">
                  {book.description}
                </p>
              </div>

              <div className="mt-8 pt-8 border-t">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Circulation Status</span>
                  <span className="text-sm font-medium">{book.availableCopies} of {book.totalCopies} Copies Available</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${book.availableCopies > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${(book.availableCopies / book.totalCopies) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t flex flex-wrap items-center gap-4">
                <Button 
                  onClick={handleReadEbook}
                  disabled={!book.ebookUrl}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-lg"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {book.ebookUrl ? "Read E-Book" : "E-Book Not Available"}
                </Button>
                
                <Button variant="outline" className="font-semibold h-12 px-6 rounded-lg">
                  <BookmarkPlus className="mr-2 h-5 w-5" /> Reserve
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Queue Table */}
          <Card>
            <CardHeader className="bg-muted/30 border-b pb-4 flex flex-row justify-between items-center space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Reservation Queue
              </CardTitle>
              <Badge variant="secondary">1 Waiting</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-muted/20 border-b">
                      <th className="font-medium text-muted-foreground px-6 py-3">Position</th>
                      <th className="font-medium text-muted-foreground px-6 py-3">Member Name</th>
                      <th className="font-medium text-muted-foreground px-6 py-3">Member ID</th>
                      <th className="font-medium text-muted-foreground px-6 py-3">Date Requested</th>
                      <th className="font-medium text-muted-foreground px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      </td>
                      <td className="px-6 py-4 font-semibold">Eleanor Vance</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground text-xs">MBR-8492</td>
                      <td className="px-6 py-4 text-muted-foreground">Oct 24, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-primary font-semibold">Notify</Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showPdfViewer && ebookUrl && (
        <PdfViewer url={ebookUrl} title={book.title} onClose={() => setShowPdfViewer(false)} />
      )}
    </div>
  );
};

export default BookDetail;
