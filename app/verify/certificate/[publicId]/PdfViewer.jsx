"use client";

import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

export default function PdfViewer({ url }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    
    // Load pdf.js dynamically from CDN to bypass Next.js/Turbopack node module resolution issues
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      if (!active) return;
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setPdfjsLib(window.pdfjsLib);
      } else {
        if (active) setError("Unable to preview certificate.");
      }
    };
    script.onerror = () => {
      if (active) setError("Unable to preview certificate.");
    };
    document.body.appendChild(script);

    return () => { 
      active = false; 
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  // Load PDF
  useEffect(() => {
    if (!pdfjsLib) return;
    
    let active = true;
    
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        if (!active) return;
        setPdfDoc(pdf);
        setIsLoading(false);
      } catch (err) {
        console.error("PDF load error:", err);
        if (!active) return;
        setError("Unable to preview certificate.");
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    return () => {
      active = false;
    };
  }, [url, pdfjsLib]);
  
  // Render Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
    
    let renderTask = null;
    let active = true;
    
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (!active) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        const containerWidth = containerRef.current.clientWidth;
        const targetWidth = containerWidth - 32; 
        
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = targetWidth / unscaledViewport.width;
        
        const finalScale = fitScale * scale;
        
        const viewport = page.getViewport({ scale: finalScale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
        
      } catch (err) {
        if (err.name === 'RenderingCancelledException') return;
        console.error("PDF render error:", err);
      }
    };
    
    renderPage();
    
    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale]);
  
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleFit = () => setScale(1.0);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border border-border bg-muted/20 w-full aspect-[1.414/1]">
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full">
      <div 
        ref={containerRef}
        className="w-full bg-muted border border-border shadow-2xl relative overflow-hidden flex flex-col items-center justify-center"
        style={{ minHeight: '300px' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-xs font-medium text-foreground uppercase tracking-widest">Loading Preview...</p>
          </div>
        )}
        
        <div className="p-4 w-full flex justify-center overflow-auto max-h-[80vh]">
          <canvas ref={canvasRef} className="shadow-md bg-white"></canvas>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-2 mt-4">
        <button 
          onClick={handleZoomOut}
          disabled={scale <= 0.5 || isLoading || !pdfDoc}
          className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleFit}
          disabled={scale === 1.0 || isLoading || !pdfDoc}
          className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors text-xs font-semibold uppercase tracking-widest"
          aria-label="Fit width"
        >
          FIT
        </button>
        <button 
          onClick={handleZoomIn}
          disabled={scale >= 3.0 || isLoading || !pdfDoc}
          className="p-2 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
