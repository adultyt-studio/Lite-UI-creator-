import { useEffect, useState } from 'react';
import Toolbar from './components/Toolbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import CanvasEditor from './components/CanvasEditor';
import { useUIStore } from './store/useStore';
import { db } from './lib/db';

export default function App() {
  const { currentProject, loadProjectFromDB, createDefaultProject, isDarkTheme } = useUIStore();
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
    <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-300 ${isDarkTheme ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <CanvasEditor />
        <RightSidebar />
      </div>
    </div>
  );
}
