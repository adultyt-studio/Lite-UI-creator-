import { useState } from 'react';
import { useUIStore } from '../store/useStore';
import { MousePointer2, Square, Circle, Type, Settings, Download, MonitorPlay } from 'lucide-react';
import { ElementType, UIElement } from '../types';
import ExportModal from './ExportModal';

export default function Toolbar() {
  const { addElement, isDarkTheme, toggleTheme } = useUIStore();
  const [showExport, setShowExport] = useState(false);

  const handleAddElement = (type: ElementType) => {
    const defaultGlass = { blur: 12, backgroundOpacity: 0.1, borderOpacity: 0.2 };
    
    let elType: ElementType = type;
    
    let baseElement: UIElement = {
      id: crypto.randomUUID(),
      type: elType,
      name: `New ${type}`,
      x: window.innerWidth / 2 - 250, // rough center
      y: window.innerHeight / 2 - 100,
      width: 100,
      height: 100,
      fill: isDarkTheme ? '#ffffff' : '#000000',
      opacity: 1,
      rotation: 0,
      cornerRadius: 16,
    };

    if (type === 'rectangle') {
      baseElement.width = 120;
      baseElement.height = 120;
      baseElement.glassmorphism = defaultGlass;
    } else if (type === 'glass-card') {
      baseElement.width = 300;
      baseElement.height = 200;
      baseElement.glassmorphism = { blur: 24, backgroundOpacity: 0.05, borderOpacity: 0.3, glow: 10, glowColor: '#a855f7' };
    } else if (type === 'glass-button') {
      baseElement.width = 160;
      baseElement.height = 50;
      baseElement.cornerRadius = 25;
      baseElement.text = "Click me";
      baseElement.fontSize = 16;
      baseElement.glassmorphism = { blur: 16, backgroundOpacity: 0.2, borderOpacity: 0.4 };
    } else if (type === 'text') {
      baseElement.text = "Type something";
      baseElement.fontSize = 24;
      baseElement.width = 200;
      baseElement.height = 50;
      baseElement.fill = 'transparent';
      baseElement.color = isDarkTheme ? '#ffffff' : '#000000';
    } else if (type === 'circle') {
      baseElement.width = 100;
      baseElement.height = 100;
      baseElement.cornerRadius = 50;
      baseElement.glassmorphism = defaultGlass;
    }

    addElement(baseElement);
  };

  return (
    <>
      <div className={`h-14 shrink-0 flex items-center justify-between px-4 border-b z-20 backdrop-blur-md ${isDarkTheme ? 'bg-[#1e293b]/80 border-slate-700/50' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
            U
          </div>
          <span className="font-semibold hidden md:block mr-4 tracking-tight">UltraLight <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">Glass</span></span>

          <div className="h-6 w-px bg-slate-500/30 mx-2"></div>

          <div className="flex space-x-1">
            <ToolButton icon={<MousePointer2 size={18} />} title="Select" active />
            <ToolButton icon={<Square size={18} />} title="Glass Card" onClick={() => handleAddElement('glass-card')} />
            <ToolButton icon={<Circle size={18} />} title="Circle" onClick={() => handleAddElement('circle')} />
            <ToolButton icon={<Type size={18} />} title="Text" onClick={() => handleAddElement('text')} />
            <ToolButton icon={<div className="font-bold text-xs truncate px-1">Btn</div>} title="Button" onClick={() => handleAddElement('glass-button')} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
           <div className="text-xs text-slate-400 hidden sm:block mr-2">Vercel Ready â</div>
           <button onClick={toggleTheme} className={`p-2 rounded-md ${isDarkTheme ? 'hover:bg-slate-700/50 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
             <Settings size={18} />
           </button>
           <button className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors" onClick={() => alert('Prototyping view coming soon!')}>
             <MonitorPlay size={16} />
             <span className="hidden sm:inline">Preview</span>
           </button>
           <button onClick={() => setShowExport(true)} className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium shadow-lg shadow-purple-500/20 transition-all border border-purple-400/30">
             <Download size={16} />
             <span className="hidden sm:inline">Export</span>
           </button>
        </div>
      </div>
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </>
  );
}

function ToolButton({ icon, title, active, onClick }: { icon: React.ReactNode, title: string, active?: boolean, onClick?: () => void }) {
  const { isDarkTheme } = useUIStore();
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
        active 
          ? (isDarkTheme ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-purple-100 text-purple-600 border border-purple-200')
          : (isDarkTheme ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200')
      }`}
    >
      {icon}
    </button>
  );
}

