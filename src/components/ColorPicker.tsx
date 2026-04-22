import React, { useState, useEffect, useRef } from 'react';
import { HsvaColorPicker } from 'react-colorful';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { useUIStore } from '../store/useStore';
import { ChevronDown, Pipette } from 'lucide-react';

extend([namesPlugin]);

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  showAlpha?: boolean;
}

export default function ColorPicker({ color, onChange, label, showAlpha = false }: ColorPickerProps) {
  const { isDarkTheme } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse incoming color to hsva
  const parsed = colord(color);
  const [hsva, setHsva] = useState(parsed.toHsv());
  const [hexInput, setHexInput] = useState(parsed.toHex());

  // Sync internal state when external color changes if not actively dragging
  useEffect(() => {
    const newParsed = colord(color);
    setHsva(newParsed.toHsv());
    setHexInput(showAlpha ? newParsed.toHex() : newParsed.toHex().slice(0, 7)); // limit to 6-char hex if no alpha
  }, [color, showAlpha]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const handleHsvaChange = (newHsva: any) => {
    setHsva(newHsva);
    const newColor = colord(newHsva);
    const hex = showAlpha ? newColor.toHex() : newColor.toHex().slice(0, 7);
    setHexInput(hex);
    onChange(hex);
  };

  const handleHexProcess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    const newColor = colord(val);
    if (newColor.isValid()) {
      setHsva(newColor.toHsv());
      onChange(showAlpha ? newColor.toHex() : newColor.toHex().slice(0, 7));
    }
  };

  const popoverBg = isDarkTheme ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200';
  const inputBg = isDarkTheme ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800';
  const labelColor = isDarkTheme ? 'text-slate-400' : 'text-slate-500';

  const presets = [
    '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', 
    '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', 
    '#a855f7', '#ec4899', '#f43f5e'
  ];

  return (
    <div className="relative flex flex-col w-full" ref={popoverRef}>
      {label && <span className="text-[10px] uppercase text-slate-500 mb-1">{label}</span>}
      
      {/* Trigger Button */}
      <button 
        className={`flex items-center justify-between w-full p-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors ${isDarkTheme ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          {/* Swatch */}
          <div 
            className="w-5 h-5 rounded-sm border border-slate-400/30"
            style={{ backgroundColor: color, backgroundImage: color.includes('rgba') || color.length === 9 ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px' }}
          >
            <div className="w-full h-full rounded-sm" style={{ backgroundColor: color }}></div>
          </div>
          <span className={`text-xs uppercase font-mono ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
            {showAlpha ? colord(color).toHex() : colord(color).toHex().slice(0, 7)}
          </span>
        </div>
        <ChevronDown size={14} className={labelColor} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className={`absolute z-50 top-full mt-2 right-0 w-64 p-3 rounded-xl border shadow-2xl ${popoverBg}`}>
          
          {/* react-colorful picker */}
          <div className="custom-color-picker mb-4">
            <HsvaColorPicker color={hsva} onChange={handleHsvaChange} className="w-full" />
          </div>

          <div className="space-y-3">
            {/* Hex Input */}
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] font-bold uppercase w-8 ${labelColor}`}>HEX</span>
              <input 
                type="text" 
                value={hexInput}
                onChange={handleHexProcess}
                className={`flex-1 text-xs px-2 py-1.5 rounded border uppercase font-mono focus:outline-none focus:ring-1 focus:ring-purple-500 ${inputBg}`}
              />
            </div>

            {/* HSVA Sliders Mapping */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-semibold ${labelColor}`}>Hue (H)</span>
                <input type="number" min="0" max="360" value={Math.round(hsva.h)} onChange={(e) => handleHsvaChange({...hsva, h: Number(e.target.value)})} className={`w-full text-xs p-1 rounded border ${inputBg}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-semibold ${labelColor}`}>Sat (S)</span>
                <input type="number" min="0" max="100" value={Math.round(hsva.s)} onChange={(e) => handleHsvaChange({...hsva, s: Number(e.target.value)})} className={`w-full text-xs p-1 rounded border ${inputBg}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] uppercase font-semibold ${labelColor}`}>Bright (V)</span>
                <input type="number" min="0" max="100" value={Math.round(hsva.v)} onChange={(e) => handleHsvaChange({...hsva, v: Number(e.target.value)})} className={`w-full text-xs p-1 rounded border ${inputBg}`} />
              </div>
              {showAlpha && (
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-semibold ${labelColor}`}>Alpha (A)</span>
                  <input type="number" min="0" max="1" step="0.01" value={hsva.a} onChange={(e) => handleHsvaChange({...hsva, a: Number(e.target.value)})} className={`w-full text-xs p-1 rounded border ${inputBg}`} />
                </div>
              )}
            </div>

            {/* Presets */}
            <div className="pt-2 border-t border-slate-500/20">
              <span className={`text-[10px] font-bold uppercase mb-2 block ${labelColor}`}>Swatches</span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(c => (
                  <button 
                    key={c}
                    onClick={() => {
                      const cParsed = colord(c).toHsv();
                      handleHsvaChange({...cParsed, a: hsva.a}); // keep current alpha when applying swatch
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300/30 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
