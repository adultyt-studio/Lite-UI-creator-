import { create } from 'zustand';
import { Project, UIElement } from '../types';
import { db } from '../lib/db';

interface UIStore {
  currentProject: Project | null;
  selectedElementIds: string[];
  clipboard: UIElement[];
  isDarkTheme: boolean;
  mobileTab: 'none' | 'layers' | 'properties';

  setCurrentProject: (project: Project) => void;
  updateCurrentProject: (updates: Partial<Project>) => void;
  setMobileTab: (tab: 'none' | 'layers' | 'properties') => void;
  
  addElement: (element: UIElement) => void;
  updateElement: (id: string, updates: Partial<UIElement>) => void;
  removeElement: (id: string) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  copy: () => void;
  paste: () => void;
  
  toggleTheme: () => void;
  
  saveProjectToDB: () => Promise<void>;
  loadProjectFromDB: (id: string) => Promise<void>;
  createDefaultProject: () => void;
}

const defaultProject: Project = {
  id: 'default-project',
  name: 'Untitled Project',
  elements: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  backgroundColor: '#1a1a2e',
  width: 390,
  height: 844, // iPhone 12 Pro dimensions default
};

export const useUIStore = create<UIStore>((set, get) => ({
  currentProject: defaultProject,
  selectedElementIds: [],
  clipboard: [],
  isDarkTheme: true,
  mobileTab: 'none',

  setCurrentProject: (project) => set({ currentProject: project, selectedElementIds: [] }),
  setMobileTab: (tab) => set({ mobileTab: tab }),
  
  updateCurrentProject: (updates) => {
    const { currentProject } = get();
    if (currentProject) {
      set({ currentProject: { ...currentProject, ...updates, updatedAt: Date.now() } });
      get().saveProjectToDB();
    }
  },

  addElement: (element) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({
      currentProject: {
        ...currentProject,
        elements: [...currentProject.elements, element]
      },
      selectedElementIds: [element.id]
    });
    get().saveProjectToDB();
  },

  updateElement: (id, updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({
      currentProject: {
        ...currentProject,
        elements: currentProject.elements.map(el => el.id === id ? { ...el, ...updates } : el)
      }
    });
    get().saveProjectToDB(); // Debounce this in a real app, but ok for now
  },

  removeElement: (id) => {
    const { currentProject, selectedElementIds } = get();
    if (!currentProject) return;
    set({
      currentProject: {
        ...currentProject,
        elements: currentProject.elements.filter(el => el.id !== id)
      },
      selectedElementIds: selectedElementIds.filter(selectedId => selectedId !== id)
    });
    get().saveProjectToDB();
  },

  reorderElement: (id, direction) => {
    const { currentProject } = get();
    if (!currentProject) return;
    const elements = [...currentProject.elements];
    const index = elements.findIndex(el => el.id === id);
    if (index < 0) return;

    const el = elements[index];
    elements.splice(index, 1);

    if (direction === 'up') {
      elements.splice(Math.min(index + 1, elements.length), 0, el);
    } else if (direction === 'down') {
      elements.splice(Math.max(index - 1, 0), 0, el);
    } else if (direction === 'top') {
      elements.push(el);
    } else if (direction === 'bottom') {
      elements.unshift(el);
    }

    set({ currentProject: { ...currentProject, elements } });
    get().saveProjectToDB();
  },

  selectElement: (id, multi = false) => {
    const { selectedElementIds } = get();
    if (multi) {
      if (selectedElementIds.includes(id)) {
        set({ selectedElementIds: selectedElementIds.filter(selectedId => selectedId !== id) });
      } else {
        set({ selectedElementIds: [...selectedElementIds, id] });
      }
    } else {
      set({ selectedElementIds: [id] });
    }
  },

  clearSelection: () => set({ selectedElementIds: [] }),

  copy: () => {
    const { currentProject, selectedElementIds } = get();
    if (!currentProject) return;
    const selected = currentProject.elements.filter(el => selectedElementIds.includes(el.id));
    set({ clipboard: JSON.parse(JSON.stringify(selected)) }); // Deep copy
  },

  paste: () => {
    const { currentProject, clipboard } = get();
    if (!currentProject || clipboard.length === 0) return;
    
    const newElements = clipboard.map(el => ({
      ...el,
      id: crypto.randomUUID(),
      x: el.x + 20,
      y: el.y + 20,
    }));

    set({
      currentProject: {
        ...currentProject,
        elements: [...currentProject.elements, ...newElements]
      },
      selectedElementIds: newElements.map(el => el.id)
    });
    get().saveProjectToDB();
  },

  toggleTheme: () => set((state) => ({ isDarkTheme: !state.isDarkTheme })),

  saveProjectToDB: async () => {
    const { currentProject } = get();
    if (currentProject) {
      await db.projects.put(currentProject);
    }
  },

  loadProjectFromDB: async (id) => {
    const project = await db.projects.get(id);
    if (project) {
      set({ currentProject: project, selectedElementIds: [] });
    }
  },

  createDefaultProject: () => {
    const id = crypto.randomUUID();
    const newProject = {
      ...defaultProject,
      id,
      name: 'New Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentProject: newProject, selectedElementIds: [] });
    get().saveProjectToDB();
  }
}));
