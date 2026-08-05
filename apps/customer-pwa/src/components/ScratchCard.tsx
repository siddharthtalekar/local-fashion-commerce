'use client';

import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  children: React.ReactNode;
  width: number;
  height: number;
  image?: string; // Optional overlay image, otherwise uses a solid color
  color?: string; // Overlay color
  brushSize?: number;
  onComplete?: () => void;
  finishPercent?: number; // 0-100, when to auto-reveal
}

export function ScratchCard({
  children,
  width,
  height,
  image,
  color = '#cbd5e1',
  brushSize = 30,
  onComplete,
  finishPercent = 50,
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill the canvas with solid color or image
    if (image) {
      const img = new window.Image();
      img.src = image;
      img.onload = () => {
        if (!isFinished) {
          ctx.drawImage(img, 0, 0, width, height);
        }
      };
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      
      // Add some subtle texture/pattern
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 20, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2);
    }
  }, [width, height, image, color, isFinished]);

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support for both touch and mouse events
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isFinished) return;
    setIsDrawing(true);
    scratch(e);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    checkCompletion();
  };

  const scratch = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDrawing || isFinished) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPointerPos(e);
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Add global listeners for smoother mouse tracking
  useEffect(() => {
    if (isDrawing) {
      const handleMove = (e: MouseEvent | TouchEvent) => scratch(e);
      const handleUp = () => handlePointerUp();
      
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDrawing]);

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    // Check alpha channel for every pixel
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const totalPixels = width * height;
    const currentPercent = (transparentPixels / totalPixels) * 100;

    if (currentPercent >= finishPercent) {
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative select-none" 
      style={{ width, height }}
    >
      <div className="absolute inset-0 z-0">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handlePointerDown}
        onTouchStart={(e) => {
          // Prevent scrolling while scratching
          if (!isFinished) e.preventDefault();
          handlePointerDown(e);
        }}
        className={`absolute inset-0 z-10 touch-none cursor-crosshair transition-opacity duration-700 ${isFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      />
    </div>
  );
}
