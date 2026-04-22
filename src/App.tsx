import { useEffect, useState } from 'react';
import Toolbar from './components/Toolbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CanvasEditor from './components/CanvasEditor';
import { useUIStore } from './store/useStore';
import { db } from './lib/db';
import { Layers, SlidersHorizontal, MousePointer2 } from 'lucide-react';

export default function App() {
  const { currentProject, loadProjectFromDB, createDefaultProject, isDarkTheme, mobileTab, setMobileTab, clearSelection } = useUIStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const projects = await db.projects.toArray();
        if (projects.length > 0) {
          // Load most recently updated
          projects.sort((a, b) => b.updatedAt - a.updatedAt);
          await loadProjectFromDB(projects[0].id);
        } else {
          createDefaultProject();
        }
      } catch (e) {
        console.error("Failed to load project", e);
        createDefaultProject();
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, [loadProjectFromDB, createDefaultProject]);

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[#0f172a] text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-teal-400 border-b-pink-500 border-l-transparent animate-spin mb-4"></div>
          <p className="text-lg font-medium text-white/70">Waking up the Glass Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen w-[100dvw] overflow-hidden font-sans transition-colors duration-300 ${isDarkTheme ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <Toolbar />
      <div className="flex flex-1 relative overflow-hidden">
        <div className={`absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileTab === 'layers' ? 'translate-x-0' : '-translate-x-full'}`}>
          <LeftSidebar />
        </div>
        
        <CanvasEditor />
        
        <div className={`absolute inset-y-0 right-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileTab === 'properties' ? 'translate-x-0' : 'translate-x-full'}`}>
          <RightSidebar />
        </div>
        
        {/* Mobile overlay backdrop */}
        {mobileTab !== 'none' && (
          <div 
            className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden" 
            onClick={() => setMobileTab('none')}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden shrink-0 flex items-center justify-around h-16 border-t z-50 backdrop-blur-xl pb-safe ${isDarkTheme ? 'bg-[#1e293b]/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
        <MobileNavBtn 
          icon={<MousePointer2 size={20} />} 
          label="Canvas" 
          active={mobileTab === 'none'} 
          onClick={() => { setMobileTab('none'); clearSelection(); }} 
        />
        <MobileNavBtn 
          icon={<Layers size={20} />} 
          label="Layers" 
          active={mobileTab === 'layers'} 
          onClick={() => setMobileTab(mobileTab === 'layers' ? 'none' : 'layers')} 
        />
        <MobileNavBtn 
          icon={<SlidersHorizontal size={20} />} 
          label="Properties" 
          active={mobileTab === 'properties'} 
          onClick={() => setMobileTab(mobileTab === 'properties' ? 'none' : 'properties')} 
        />
      </div>
    </div>
  );
}

function MobileNavBtn({ icon, label, active, onClick }: any) {
  const { isDarkTheme } = useUIStore();
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-purple-500' : isDarkTheme ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
