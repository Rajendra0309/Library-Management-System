import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ url, title, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isSepiaMode, setIsSepiaMode] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const viewerRef = useRef(null);

  // Disable right-click to prevent easy downloading and lock body scroll
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.overflow = 'hidden'; // prevent double scrollbar

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Hide/Show controls strictly based on hover zones
  const handleMouseMove = (e) => {
    const { clientY } = e;
    const threshold = 120; // Show controls if mouse is within 120px of top or bottom
    if (clientY < threshold || window.innerHeight - clientY < threshold) {
      setIsControlsVisible(true);
    } else {
      setIsControlsVisible(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setPageNumber(prev => Math.max(1, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setPageNumber(prev => numPages ? Math.min(numPages, prev + 1) : prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages]);

  // Ctrl+Wheel Zoom
  useEffect(() => {
    const element = viewerRef.current;
    if (!element) return;
    const handleWheel = (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setScale(s => Math.min(3, s + 0.1));
        } else {
          setScale(s => Math.max(0.5, s - 0.1));
        }
      }
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div 
      ref={viewerRef} 
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-[100] flex flex-col bg-black antialiased overflow-hidden"
    >
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-surface shadow-sm z-20 transition-transform duration-300 ${isControlsVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="font-headline-sm text-headline-sm text-on-surface truncate max-w-[200px] md:max-w-md">{title || "Secure Reader"}</h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Controls: Reading Mode, Rotate, Fullscreen */}
          <button 
            onClick={() => setIsSepiaMode(!isSepiaMode)}
            title="Reading Mode"
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isSepiaMode ? 'bg-primary/20 text-primary' : 'text-on-surface hover:bg-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[20px]">light_mode</span>
          </button>
          <button 
            onClick={rotate}
            title="Rotate"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">rotate_right</span>
          </button>
          <button 
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-variant transition-colors hidden sm:flex"
          >
            <span className="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>

          <div className="w-px h-6 bg-border-default mx-1 hidden sm:block"></div>

          {/* Zoom */}
          <div className="flex items-center bg-surface-variant rounded-lg p-1">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">remove</span>
            </button>
            <span className="px-3 font-label-md text-label-md text-on-surface w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(3, s + 0.1))}
              className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full h-full overflow-auto flex justify-center p-8 select-none transition-colors ${isSepiaMode ? 'bg-[#1a1a1a]' : 'bg-black'} cursor-default`}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
              <span className="material-symbols-outlined animate-spin text-[40px]">progress_activity</span>
              <p className="font-headline-sm">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full gap-4 text-error">
              <span className="material-symbols-outlined text-[40px]">error</span>
              <p className="font-headline-sm">Failed to load document.</p>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            rotate={rotation}
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className={`shadow-xl transition-all duration-300 ${isSepiaMode ? 'sepia-[.4] hue-rotate-[-10deg] brightness-95' : ''}`}
          />
        </Document>
      </div>

      {/* Bottom Bar (Pagination) */}
      <div className={`absolute bottom-0 left-0 w-full flex items-center justify-center gap-6 px-6 py-4 bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 transition-transform duration-300 ${isControlsVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <button
          type="button"
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <p className="font-body-lg text-body-lg text-on-surface w-32 text-center">
          Page <span className="font-semibold">{pageNumber || (numPages ? 1 : '--')}</span> of <span className="font-semibold">{numPages || '--'}</span>
        </p>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-on-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
