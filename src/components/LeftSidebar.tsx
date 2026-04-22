import { useUIStore } from '../store/useStore';
import { Layers, Cuboid, AppWindow, MoveUp, MoveDown, Trash2, Github } from 'lucide-react';

export default function LeftSidebar() {
  const { currentProject, selectedElementIds, selectElement, removeElement, reorderElement, isDarkTheme } = useUIStore();

  if (!currentProject) return null;

  return (
    <div className={`w-64 shrink-0 flex flex-col border-r z-10 backdrop-blur-md ${isDarkTheme ? 'bg-[#1e293b]/50 border-slate-700/50' : 'bg-white/50 border-slate-200'}`}>
      <div className="p-4 border-b border-inherit">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
          <AppWindow size={14} className="mr-2" /> Project
        </h2>
        <div className="mt-2 text-sm truncate font-medium">{currentProject.name}</div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center">
            <Layers size={14} className="mr-2" /> Layers
          </h2>
          
          <div className="space-y-1">
            {/* Show elements in reverse so top layers are on top */}
            {[...currentProject.elements].reverse().map((el, i, arr) => {
              const originalIndex = arr.length - 1 - i;
              const isSelected = selectedElementIds.includes(el.id);
              return (
                <div 
                  key={el.id}
                  onClick={() => selectElement(el.id)}
                  className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors ${
                    isSelected 
                      ? (isDarkTheme ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700')
                      : (isDarkTheme ? 'hover:bg-slate-800' : 'hover:bg-slate-100')
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Cuboid size={14} className="opacity-50 shrink-0" />
                    <span className="truncate">{el.name}</span>
                  </div>
                  
                  {isSelected && (
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'up'); }} className="p-1 hover:bg-white/10 rounded">
                        <MoveUp size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'down'); }} className="p-1 hover:bg-white/10 rounded">
                        <MoveDown size={12} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeElement(el.id); }} className="p-1 hover:bg-red-500/20 text-red-400 rounded">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {currentProject.elements.length === 0 && (
              <div className="text-xs text-slate-500 text-center py-4">No layers yet.<br/>Add a glass card to begin.</div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-inherit text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center space-x-2">
        <a href="https://github.com/adultyt-studio/ultra-light-glasmorphism-ui-studio" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
          <div className="flex items-center space-x-1 font-medium group-hover:text-purple-400">
             <Github size={14} />
             <span>@adultyt-studio</span>
          </div>
          <span className="text-[9px] mt-1 opacity-50">Glassmorphism UI Studio</span>
        </a>
      </div>
    </div>
  );
}
