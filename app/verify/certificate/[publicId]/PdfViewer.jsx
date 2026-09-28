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
    
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      if (!active) return;
      
      const pdfjs = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
      
      if (pdfjs) {
        window.pdfjsLib = pdfjs;
        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        setPdfjsLib(pdfjs);
      } else {
        if (active) setError("CDN Load Error: pdfjsLib object is undefined on window.");
      }
    };
    script.onerror = () => {
      if (active) setError("CDN Load Error: Failed to load pdf.min.js script.");
    };
    document.body.appendChild(script);

    return () => { 
      active = false; 
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
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
        setError("PDF Load Error: " + (err.message || String(err)));
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    return () => {
      active = false;
    };
  }, [url, pdfjsLib]);
  
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
        
        const outputScale = window.devicePixelRatio || 1;
        const containerWidth = containerRef.current.clientWidth;
        
        // 32px for padding (16px each side)
        const targetWidth = containerWidth - 32; 
        
        const unscaledViewport = page.getViewport({ scale: 1 });
        const fitScale = targetWidth / unscaledViewport.width;
        
        const finalScale = fitScale * scale;
        const viewport = page.getViewport({ scale: finalScale });
        
        // STRICTLY set CSS dimensions to prevent flexbox/tailwind stretching
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        
        // Set actual canvas backing store dimensions multiplied by pixel ratio for sharpness
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        
        // Scale context to match pixel ratio
        ctx.scale(outputScale, outputScale);
        
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
        <p className="text-xs text-muted-foreground mt-4 text-center max-w-sm">
          If this says "PDF Load Error: Failed to fetch", it is likely a CORS issue on your Object Storage bucket. Ensure your bucket is configured to allow GET requests from this domain.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full">
      <div 
        ref={containerRef}
        className="w-full bg-muted border border-border shadow-xl relative overflow-hidden flex flex-col items-center justify-center rounded-sm transition-all"
        style={{ minHeight: '60vh' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <div className="relative flex items-center justify-center h-20 w-20 mb-6">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 border-t-2 border-primary/80 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
              {/* Inner opposite spinning ring */}
              <div className="absolute inset-3 border-r-2 border-primary/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              {/* Center pulsing core */}
              <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-sm font-bold tracking-[0.25em] text-foreground uppercase">Rendering</h3>
              <p className="text-xs text-muted-foreground tracking-widest animate-pulse">SECURING CERTIFICATE...</p>
            </div>
          </div>
        )}
        
        <div className="p-4 w-full flex justify-center overflow-auto max-h-[75vh]">
          {/* Wrapper to isolate canvas from flex behaviors */}
          <div className="relative shadow-2xl bg-white flex-shrink-0" style={{ display: 'inline-block' }}>
            <canvas ref={canvasRef} className="block"></canvas>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center gap-3 mt-6">
        <button 
          onClick={handleZoomOut}
          disabled={scale <= 0.5 || isLoading || !pdfDoc}
          className="p-3 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleFit}
          disabled={scale === 1.0 || isLoading || !pdfDoc}
          className="px-6 py-3 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors text-xs font-bold uppercase tracking-[0.2em] shadow-sm"
          aria-label="Fit width"
        >
          FIT
        </button>
        <button 
          onClick={handleZoomIn}
          disabled={scale >= 3.0 || isLoading || !pdfDoc}
          className="p-3 border border-border rounded hover:bg-muted disabled:opacity-50 transition-colors shadow-sm"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
