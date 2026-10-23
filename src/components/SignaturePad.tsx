import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle, PenLine } from 'lucide-react';
import { trimCanvasWhitespace } from '../utils/textUtils';

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
  error?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  error
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const isUserDrawingRef = useRef(false);

  // Initialize or resize canvas with high DPI sharpness
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (isUserDrawingRef.current) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const displayWidth = rect.width;
    const displayHeight = window.innerWidth < 640 ? 220 : 250;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // If there is existing value, draw it
    if (value && !isUserDrawingRef.current) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
          setHasDrawn(true);
        }
      };
      img.src = value;
    }
  }, [value]);

  useEffect(() => {
    if (!value) {
      isUserDrawingRef.current = false;
      setHasDrawn(false);
    }
  }, [value]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      // Don't wipe canvas if already drawn, but preserve aspect
      if (!hasDrawn) {
        setupCanvas();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas, hasDrawn]);

  // Pointer coordinate calculation relative to canvas display size
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    setIsDrawing(true);
    isUserDrawingRef.current = true;
    lastPointRef.current = coords;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial dot
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#1e3a8a';
    ctx.fill();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    lastPointRef.current = coords;
    if (!hasDrawn) {
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Emit trimmed PNG data URL without excessive outer whitespace
    const trimmedDataUrl = trimCanvasWhitespace(canvas);
    onChange(trimmedDataUrl);
    setHasDrawn(true);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    isUserDrawingRef.current = false;
    onChange('');
    setHasDrawn(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5 text-blue-700" />
          Tanda Tangan Digital <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {hasDrawn ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Tanda Tangan Terisi
            </span>
          ) : (
            <span className="text-[11px] text-slate-600">
              Goreskan jari / kursor mouse di dalam kotak
            </span>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Hapus
          </button>
        </div>
      </div>

      <div
        className={`relative w-full rounded-xl border bg-white overflow-hidden shadow-xs touch-none min-h-[220px] sm:min-h-[250px] ${
          error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : hasDrawn
            ? 'border-blue-300 ring-1 ring-blue-100'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        {/* Subtle document baseline marker */}
        <div className="absolute inset-x-8 bottom-9 border-b border-dashed border-slate-200 pointer-events-none flex justify-between items-center text-[10px] text-slate-400">
          <span>Garis tanda tangan</span>
          <span>Dit. PPISDA Presensi</span>
        </div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair block bg-transparent"
        />

        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <span className="text-xs text-slate-600 font-medium">
              Bubuhkan tanda tangan di sini
            </span>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-slate-600">
          Tanda tangan ini akan dicantumkan secara resmi dalam Berita Acara / Dokumen PDF Daftar Hadir.
        </p>
      )}
    </div>
  );
};
