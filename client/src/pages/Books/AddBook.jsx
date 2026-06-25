import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Archive, 
  Upload,
  AlertCircle
} from 'lucide-react';

const InputField = ({ label, name, type = 'text', placeholder, required = false, value, onChange, error }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className={error ? "text-destructive" : ""}>
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={error ? "border-destructive focus-visible:ring-destructive" : ""}
    />
    {error && (
      <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </p>
    )}
  </div>
);

const AddBook = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    language: 'English',
    publisher: '',
    publishYear: '',
    description: '',
    totalCopies: 1,
  });

  const [coverFile, setCoverFile] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [customGenre, setCustomGenre] = useState('');

  const genres = ['Programming', 'Technology', 'Science', 'History', 'Business', 'Education', 'Fiction', 'Non-Fiction', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (error) setError('');
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return setError('Only JPG, JPEG, PNG and WEBP images are allowed.');
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleEbookChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      return setError('Only PDF files are allowed.');
    }
    setEbookFile(file);
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.author.trim()) errors.author = 'Author is required.';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required.';
    if (!formData.genre.trim()) errors.genre = 'Genre is required.';
    if (!formData.language.trim()) errors.language = 'Language is required.';
    if (!formData.publishYear || Number(formData.publishYear) < 1000 || Number(formData.publishYear) > new Date().getFullYear()) {
      errors.publishYear = 'Enter a valid publish year.';
    }
    if (!formData.description.trim()) errors.description = 'Description is required.';
    if (Number(formData.totalCopies) < 1) errors.totalCopies = 'Total copies must be at least 1.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (formData.genre === 'Other' && !customGenre.trim()) {
      setFieldErrors({ genre: 'Please enter a custom genre.' });
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('isbn', formData.isbn);
      data.append('genre', formData.genre === 'Other' ? customGenre : formData.genre);
      data.append('language', formData.language);
      data.append('publisher', formData.publisher);
      data.append('publishYear', formData.publishYear);
      data.append('description', formData.description);
      data.append('totalCopies', formData.totalCopies);

      if (coverFile) data.append('cover', coverFile);
      if (ebookFile) data.append('ebook', ebookFile);

      await api.post('/books', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/books', {
        state: { successMsg: `"${formData.title}" added successfully.` },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" onClick={() => navigate('/books')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader 
          title="Add New Book" 
          description="Create a new book record in the library catalog."
          className="mb-0"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Book Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Book Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              error={fieldErrors.title}
            />
            <InputField
              label="Author"
              name="author"
              required
              value={formData.author}
              onChange={handleChange}
              error={fieldErrors.author}
            />
            <InputField
              label="ISBN"
              name="isbn"
              required
              value={formData.isbn}
              onChange={handleChange}
              error={fieldErrors.isbn}
            />
            
            <div className="space-y-2">
              <Label htmlFor="genre" className={fieldErrors.genre ? "text-destructive" : ""}>
                Genre <span className="text-destructive">*</span>
              </Label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className={`flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.genre ? "border-destructive focus:ring-destructive" : "border-input"}`}
              >
                <option value="">Select Genre</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {fieldErrors.genre && (
                <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.genre}
                </p>
              )}
              {formData.genre === 'Other' && (
                <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
                  <Label htmlFor="customGenre">Custom Genre</Label>
                  <Input
                    id="customGenre"
                    type="text"
                    placeholder="Enter custom genre"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                  />
                </div>
              )}
            </div>

            <InputField
              label="Language"
              name="language"
              required
              value={formData.language}
              onChange={handleChange}
              error={fieldErrors.language}
            />
            <InputField
              label="Publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              error={fieldErrors.publisher}
            />
            <InputField
              label="Publish Year"
              name="publishYear"
              type="number"
              required
              value={formData.publishYear}
              onChange={handleChange}
              error={fieldErrors.publishYear}
            />
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <textarea
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${fieldErrors.description ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                placeholder="Enter book description..."
              />
              {fieldErrors.description && (
                <p className="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Archive className="h-5 w-5 text-primary" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <InputField
                label="Total Copies"
                name="totalCopies"
                type="number"
                required
                value={formData.totalCopies}
                onChange={handleChange}
                error={fieldErrors.totalCopies}
              />
            </div>
          </CardContent>
        </Card>

        {/* Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-primary" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleCoverChange}
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
              {coverPreview && (
                <div className="mt-4 rounded-xl border overflow-hidden bg-muted flex items-center justify-center aspect-[3/4] max-w-[200px]">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ebook PDF</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleEbookChange}
                  className="cursor-pointer file:cursor-pointer"
                />
              </div>
              {ebookFile && (
                <div className="mt-4 p-4 rounded-lg bg-muted border flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate" title={ebookFile.name}>
                      {ebookFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(ebookFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/books')}
            disabled={loading}
            className="w-32"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-40"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              'Create Book'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;