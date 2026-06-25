import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, Sun, Moon, RotateCw, Maximize, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set up the worker for react-pdf using unpkg with .js extension instead of .mjs which often fails
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm antialiased overflow-hidden"
    >
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-md border-b shadow-sm z-20 transition-transform duration-300 ${isControlsVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="rounded-full bg-muted/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-md">{title || "Secure Reader"}</h2>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Controls: Reading Mode, Rotate, Fullscreen */}
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsSepiaMode(!isSepiaMode)}
            title="Reading Mode"
            className={`rounded-full ${isSepiaMode ? 'bg-primary/20 text-primary' : ''}`}
          >
            {isSepiaMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={rotate}
            title="Rotate"
            className="rounded-full"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="rounded-full hidden sm:flex"
          >
            <Maximize className="h-5 w-5" />
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

          {/* Zoom */}
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button 
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium text-foreground w-16 text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <Button 
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setScale(s => Math.min(3, s + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 w-full h-full overflow-auto flex justify-center p-8 select-none transition-colors ${isSepiaMode ? 'bg-[#1a1a1a]' : 'bg-transparent'} cursor-default`}>
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full gap-4 text-primary mt-[20vh]">
              <Loader2 className="h-12 w-12 animate-spin" />
              <p className="font-medium">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive mt-[20vh]">
              <AlertCircle className="h-12 w-12" />
              <p className="font-medium">Failed to load document.</p>
              <Button variant="outline" onClick={onClose}>Close Viewer</Button>
            </div>
          }
        >
          {numPages && (
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              rotate={rotation}
              renderTextLayer={false} 
              renderAnnotationLayer={false}
              className={`shadow-2xl transition-all duration-300 ${isSepiaMode ? 'sepia-[.4] hue-rotate-[-10deg] brightness-95' : ''}`}
            />
          )}
        </Document>
      </div>

      {/* Bottom Bar (Pagination) */}
      <div className={`absolute bottom-0 left-0 w-full flex items-center justify-center gap-6 px-6 py-4 bg-background/90 backdrop-blur-md border-t shadow-sm z-20 transition-transform duration-300 ${isControlsVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <Button
          variant="outline"
          size="icon"
          disabled={pageNumber <= 1}
          onClick={previousPage}
          className="h-10 w-10 rounded-full shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <p className="text-sm font-medium text-foreground w-32 text-center tabular-nums">
          Page <span className="font-bold">{pageNumber || (numPages ? 1 : '--')}</span> of <span className="font-bold">{numPages || '--'}</span>
        </p>
        <Button
          variant="outline"
          size="icon"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
          className="h-10 w-10 rounded-full shadow-sm"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PdfViewer;
