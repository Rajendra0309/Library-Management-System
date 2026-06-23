import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

/*
=====================================
Reusable Input Field
=====================================
*/
const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  error,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5"
    >
      {label}{' '}
      {required && <span className="text-red-500">*</span>}
    </label>

    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full rounded-lg border px-3 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm ${
        error
          ? 'border-red-400 bg-red-50'
          : 'border-border-default focus:border-primary'
      }`}
    />

    {error && (
      <p className="mt-1 font-body-sm text-body-sm text-red-500 flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">
          error
        </span>
        {error}
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

  /*
  =====================================
  Handle Input Change
  =====================================
  */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (error) {
      setError('');
    }
  };

  /*
  =====================================
  Cover Upload
  =====================================
  */
  const handleCoverChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      return setError(
        'Only JPG, JPEG, PNG and WEBP images are allowed.'
      );
    }

    setCoverFile(file);

    setCoverPreview(
      URL.createObjectURL(file)
    );
  };

  /*
  =====================================
  Ebook Upload
  =====================================
  */
  const handleEbookChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (
      file.type !== 'application/pdf'
    ) {
      return setError(
        'Only PDF files are allowed.'
      );
    }

    setEbookFile(file);
  };

  /*
  =====================================
  Validation
  =====================================
  */
  const validate = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title =
        'Title is required.';
    }

    if (!formData.author.trim()) {
      errors.author =
        'Author is required.';
    }

    if (!formData.isbn.trim()) {
      errors.isbn =
        'ISBN is required.';
    }

    if (!formData.genre.trim()) {
      errors.genre =
        'Genre is required.';
    }

    if (!formData.language.trim()) {
      errors.language =
        'Language is required.';
    }

    if (
      !formData.publishYear ||
      Number(formData.publishYear) < 1000 ||
      Number(formData.publishYear) >
        new Date().getFullYear()
    ) {
      errors.publishYear =
        'Enter a valid publish year.';
    }

    if (
      !formData.description.trim()
    ) {
      errors.description =
        'Description is required.';
    }

    if (
      Number(formData.totalCopies) < 1
    ) {
      errors.totalCopies =
        'Total copies must be at least 1.';
    }

    return errors;
  };

  /*
  =====================================
  Submit
  =====================================
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();

    if (
      Object.keys(errors).length > 0
    ) {
      setFieldErrors(errors);
      return;
    }

    if (
    formData.genre === 'Other' &&
    !customGenre.trim()
    ) {
    errors.genre =
        'Please enter a custom genre.';
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        'title',
        formData.title
      );

      data.append(
        'author',
        formData.author
      );

      data.append(
        'isbn',
        formData.isbn
      );

      data.append(
      'genre',
       formData.genre === 'Other'
        ? customGenre
        : formData.genre
      );

      data.append(
        'language',
        formData.language
      );

      data.append(
        'publisher',
        formData.publisher
      );

      data.append(
        'publishYear',
        formData.publishYear
      );

      data.append(
        'description',
        formData.description
      );

      data.append(
        'totalCopies',
        formData.totalCopies
      );

      if (coverFile) {
        data.append(
          'cover',
          coverFile
        );
      }

      if (ebookFile) {
        data.append(
          'ebook',
          ebookFile
        );
      }

      await api.post(
        '/books',
        data,
        {
          headers: {
            'Content-Type':
              'multipart/form-data',
          },
        }
      );

      navigate('/books', {
        state: {
          successMsg: `"${formData.title}" added successfully.`,
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to create book.'
      );
    } finally {
      setLoading(false);
    }
  };
    return (
    <div className="flex-1 w-full max-w-content-max-width mx-auto p-page-padding">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="p-2 rounded-lg border border-border-default text-on-surface-variant hover:bg-bg-hover transition-colors"
          onClick={() => navigate('/books')}
        >
          <span className="material-symbols-outlined text-lg">
            arrow_back
          </span>
        </button>

        <div>
          <h1 className="font-display-3xl text-display-3xl text-on-surface">
            Add New Book
          </h1>

          <p className="font-body-base text-body-base text-text-secondary">
            Create a new book record in the library catalog.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <span className="material-symbols-outlined text-red-500 text-xl mt-0.5 flex-shrink-0">
            error
          </span>

          <p className="font-body-sm text-body-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-[14px] shadow-sm border border-border-subtle"
      >

        {/* Book Information */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              menu_book
            </span>
            Book Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5">
                Genre
              </label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm bg-surface"
              >
                <option value="">Select Genre</option>
                <option value="Programming">Programming</option>
                <option value="Technology">Technology</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Other">Other</option>
              </select>
                {formData.genre === 'Other' && (
                    <div className="mt-4">
                    <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-1.5">
                        Custom Genre
                    </label>

                    <input
                        type="text"
                        placeholder="Enter custom genre"
                        value={customGenre}
                        onChange={(e) => setCustomGenre(e.target.value)}
                        className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:border-primary focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
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

          </div>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              description
            </span>
            Description
          </h2>

          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-lg border border-border-default px-3 py-2 text-body-base focus:ring-2 focus:ring-focus-ring outline-none transition-all shadow-sm"
            placeholder="Enter book description..."
          />

          {fieldErrors.description && (
            <p className="mt-2 text-red-500 text-sm">
              {fieldErrors.description}
            </p>
          )}
        </div>

        {/* Inventory */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              inventory_2
            </span>
            Inventory
          </h2>

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

        {/* Uploads */}
        <div className="p-6 border-b border-border-subtle">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              cloud_upload
            </span>
            Upload Files
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Cover Upload */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-2">
                Cover Image
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleCoverChange}
                className="w-full"
              />

              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Preview"
                  className="mt-4 h-56 w-auto rounded-lg border border-border-subtle"
                />
              )}
            </div>

            {/* Ebook Upload */}
            <div>
              <label className="block font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant mb-2">
                Ebook PDF
              </label>

              <input
                type="file"
                accept=".pdf"
                onChange={handleEbookChange}
                className="w-full"
              />

              {ebookFile && (
                <div className="mt-4 p-3 rounded-lg bg-bg-hover border border-border-subtle">
                  <p className="text-sm text-on-surface">
                    {ebookFile.name}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3 justify-end">

          <button
            type="button"
            className="px-6 py-2.5 rounded-lg border border-border-default font-body-sm text-body-sm text-on-surface hover:bg-bg-hover transition-colors"
            onClick={() => navigate('/books')}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-lg bg-primary text-white font-body-sm text-body-sm font-semibold hover:shadow-[0_4px_14px_0_rgba(91,79,232,0.39)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">
                  add
                </span>
                Create Book
              </>
            )}
          </button>

        </div>
      </form>
    </div>
  );
};

export default AddBook;