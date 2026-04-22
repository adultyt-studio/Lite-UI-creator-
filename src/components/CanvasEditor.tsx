import React, { useRef, useState, useEffect } from 'react';
import { useUIStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { UIElement } from '../types';

export default function CanvasEditor() {
  const { currentProject, selectedElementIds, selectElement, updateElement, isDarkTheme, clearSelection, copy, paste, removeElement } = useUIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas Transform State
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    // Center the project initially
    if (containerRef.current && currentProject) {
      const containerInfo = containerRef.current.getBoundingClientRect();
      setPan({
        x: (containerInfo.width - currentProject.width) / 2,
        y: (containerInfo.height - currentProject.height) / 2,
      });
    }
  }, [currentProject?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedElementIds.forEach(id => removeElement(id));
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        paste();
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementIds, copy, paste, removeElement, clearSelection]);

  if (!currentProject) return null;

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      e.preventDefault();
      const zoomSensitivity = 0.005;
      const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
      
      // Calculate mouse position relative to canvas
      // So zoom happens at mouse cursor
      setScale(newScale);
    } else {
      // Pan
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 255;
    return `rgba(${r},${g},${b},${opacity})`;
  };

  return (
    <div 
      className={`flex-1 relative overflow-hidden ${isDarkTheme ? 'bg-[#0b1120]' : 'bg-slate-100'} cursor-grab ${isPanning ? 'cursor-grabbing' : ''}`}
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={(e) => {
        if (e.button === 1 || e.button === 2 || e.shiftKey) { // Middle click, right click, or shift-click for panning
          setIsPanning(true);
          e.preventDefault();
        } else {
           if (e.target === containerRef.current || (e.target as HTMLElement).id === "workspace-bg") {
             clearSelection();
           }
        }
      }}
      onPointerUp={() => setIsPanning(false)}
      onPointerLeave={() => setIsPanning(false)}
      onPointerMove={(e) => {
        if (isPanning) {
          setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
        }
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid Pattern Background */}
      <div 
        id="workspace-bg"
        className="absolute inset-0 z-0 pointer-events-auto"
        style={{
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundImage: isDarkTheme 
            ? `radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.05) 1.5px, transparent 0)`
            : `radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.05) 1.5px, transparent 0)`,
          backgroundPosition: `${pan.x}px ${pan.y}px`
        }}
      />

      {/* Canvas Area wrapper mapping to pan & scale */}
      <div 
        className="absolute origin-top-left z-10"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: currentProject.width,
          height: currentProject.height,
        }}
      >
        {/* Device Frame / Artboard background */}
        <div 
          className={`absolute inset-0 shadow-2xl rounded-[40px] overflow-hidden border-[8px] ${isDarkTheme ? 'bg-[#1a1a2e] border-slate-800' : 'bg-slate-100 border-white'}`}
          style={{ width: currentProject.width, height: currentProject.height }}
        >
          {/* Default Decorative Backgrounds inside the artboard so glass has something to blur */}
          <div className="absolute top-10 -left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          <div className="absolute bottom-10 -right-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
          <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-500 rounded-full mix-blend-screen filter blur-[60px] opacity-30"></div>
        </div>

        {/* Elements */}
        {currentProject.elements.map(el => {
          const isSelected = selectedElementIds.includes(el.id);
          
          let glassStyles: React.CSSProperties = {};
          if (el.glassmorphism) {
            const { blur, backgroundOpacity, borderOpacity, glow, glowColor } = el.glassmorphism;
            const baseColor = el.fill || '#ffffff';
            
            glassStyles = {
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              backgroundColor: hexToRgba(baseColor, backgroundOpacity),
              border: `1px solid ${hexToRgba('#ffffff', borderOpacity)}`,
              boxShadow: glow ? `0 8px 32px 0 ${hexToRgba(glowColor || baseColor, glow / 100)}, inset 0 0 0 1px ${hexToRgba('#ffffff', borderOpacity / 2)}` : `0 8px 32px 0 ${hexToRgba('#000000', 0.1)}`,
            };
          } else if (el.type === 'rectangle' || el.type === 'circle') {
             glassStyles = {
               backgroundColor: el.fill || '#ffffff',
             };
          }

          if (el.type === 'text') {
             glassStyles = {
               color: el.color || el.fill || '#ffffff',
               fontSize: el.fontSize,
               fontFamily: el.fontFamily || 'Inter, sans-serif',
               fontWeight: 500,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               ...glassStyles
             };
          }

          return (
            <motion.div
              key={el.id}
              drag
              dragMomentum={false}
              onDragEnd={(e, info) => {
                updateElement(el.id, {
                  x: el.x + info.offset.x / scale,
                  y: el.y + info.offset.y / scale
                });
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                selectElement(el.id, e.shiftKey);
              }}
              className={`absolute flex items-center justify-center pointer-events-auto ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-transparent' : ''}`}
              style={{
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.type === 'text' ? 'auto' : el.height,
                borderRadius: Array.isArray(el.cornerRadius) ? el.cornerRadius.map(c => `${c}px`).join(' ') : el.cornerRadius,
                opacity: el.opacity,
                rotate: el.rotation,
                ...glassStyles
              }}
            >
              {el.text && el.type !== 'text' && (
                <span style={{ color: el.color || (isDarkTheme ? '#fff' : '#000'), fontSize: el.fontSize, fontWeight: 600 }}>
                  {el.text}
                </span>
              )}
              {el.type === 'text' && el.text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
