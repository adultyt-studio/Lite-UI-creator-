import { useUIStore } from '../store/useStore';
import { SlidersHorizontal, Type, Box } from 'lucide-react';
import React from 'react';

export default function RightSidebar() {
  const { currentProject, selectedElementIds, updateElement, isDarkTheme } = useUIStore();

  if (!currentProject) return null;

  const selectedElement = currentProject.elements.find(el => el.id === selectedElementIds[0]);

  const handleChange = (id: string, field: string, value: any) => {
    updateElement(id, { [field]: value });
  };

  const handleGlassChange = (id: string, field: string, value: any) => {
    if (!selectedElement) return;
    const currentGlass = selectedElement.glassmorphism || { blur: 0, backgroundOpacity: 0.1, borderOpacity: 0.2 };
    updateElement(id, { glassmorphism: { ...currentGlass, [field]: value } });
  };

  return (
    <div className={`w-72 shrink-0 flex flex-col border-l z-10 backdrop-blur-md overflow-y-auto ${isDarkTheme ? 'bg-[#1e293b]/50 border-slate-700/50' : 'bg-white/50 border-slate-200'}`}>
      <div className="p-4 border-b border-inherit">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
          <SlidersHorizontal size={14} className="mr-2" /> Properties
        </h2>
      </div>

      {!selectedElement ? (
        <div className="p-6 text-center text-sm text-slate-500 flex flex-col items-center">
          <Box className="w-12 h-12 mb-3 opacity-20" />
          <p>Select an element to edit properties</p>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Identity */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">Position & Size</h3>
            <div className="grid grid-cols-2 gap-2">
              <PropInput label="X" value={selectedElement.x} onChange={(v) => handleChange(selectedElement.id, 'x', Number(v))} />
              <PropInput label="Y" value={selectedElement.y} onChange={(v) => handleChange(selectedElement.id, 'y', Number(v))} />
              <PropInput label="W" value={selectedElement.width} onChange={(v) => handleChange(selectedElement.id, 'width', Number(v))} />
              <PropInput label="H" value={selectedElement.height} onChange={(v) => handleChange(selectedElement.id, 'height', Number(v))} />
              <PropInput label="Radius" value={Number(selectedElement.cornerRadius) || 0} onChange={(v) => handleChange(selectedElement.id, 'cornerRadius', Number(v))} />
            </div>
          </div>

          {/* Fill & Color */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">Appearance</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Base Color</span>
                <input type="color" value={selectedElement.fill || '#ffffff'} onChange={(e) => handleChange(selectedElement.id, 'fill', e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
              </div>
            </div>
          </div>

          {/* Glassmorphism */}
          {selectedElement.glassmorphism && (
            <div className="space-y-3 p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-purple-500/20">
              <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400 flex items-center">
                <Box size={14} className="mr-2 text-purple-400" /> Glassmorphism Form
              </h3>
              
              <div className="space-y-4">
                <SliderProp label="Blur" value={selectedElement.glassmorphism.blur} max={40} onChange={(v) => handleGlassChange(selectedElement.id, 'blur', v)} />
                <SliderProp label="Bg Opacity" value={selectedElement.glassmorphism.backgroundOpacity} max={1} step={0.05} onChange={(v) => handleGlassChange(selectedElement.id, 'backgroundOpacity', v)} />
                <SliderProp label="Border Opacity" value={selectedElement.glassmorphism.borderOpacity} max={1} step={0.05} onChange={(v) => handleGlassChange(selectedElement.id, 'borderOpacity', v)} />
                <SliderProp label="Neon Glow" value={selectedElement.glassmorphism.glow || 0} max={50} onChange={(v) => handleGlassChange(selectedElement.id, 'glow', v)} />
              </div>
            </div>
          )}

          {/* Text Properties */}
          {selectedElement.text !== undefined && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-400">Typography</h3>
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={selectedElement.text}
                  onChange={(e) => handleChange(selectedElement.id, 'text', e.target.value)}
                  className={`w-full text-sm p-2 rounded-md border ${isDarkTheme ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`} 
                />
                <div className="grid grid-cols-2 gap-2">
                  <PropInput label="Size" value={selectedElement.fontSize || 16} onChange={(v) => handleChange(selectedElement.id, 'fontSize', Number(v))} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-slate-500 mb-1">Color</span>
                    <input type="color" value={selectedElement.color || '#ffffff'} onChange={(e) => handleChange(selectedElement.id, 'color', e.target.value)} className="w-full h-8 rounded cursor-pointer bg-transparent" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PropInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
  const { isDarkTheme } = useUIStore();
  return (
    <div className="flex flex-col">
      <label className="text-[10px] uppercase text-slate-500 mb-1">{label}</label>
      <input 
        type="number" 
        value={Math.round(value)} 
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full text-xs p-1.5 rounded border focus:outline-none focus:ring-1 focus:ring-purple-500 ${isDarkTheme ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300'}`} 
      />
    </div>
  );
}

function SliderProp({ label, value, max, step = 1, onChange }: { label: string, value: number, max: number, step?: number, onChange: (val: number) => void }) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max={max} 
        step={step}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" 
      />
    </div>
  );
}
