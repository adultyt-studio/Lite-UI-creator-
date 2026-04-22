import React, { useState } from 'react';
import { useUIStore } from '../store/useStore';
import { X, Code, FileJson, LayoutTemplate, Download, Image as ImageIcon } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const { currentProject, isDarkTheme } = useUIStore();
  const [activeTab, setActiveTab] = useState<'json' | 'html' | 'godot' | 'image'>('json');
  const [isExportingImage, setIsExportingImage] = useState(false);

  if (!currentProject) return null;

  const hexToRgbaCSS = (hex: string, opacity: number) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const generateJSON = () => JSON.stringify(currentProject, null, 2);

  const generateHTML = () => {
    let elementsHTML = currentProject.elements.map(el => {
      let styles = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; border-radius: ${el.cornerRadius}px;`;
      
      if (el.glassmorphism) {
        const { blur, backgroundOpacity, borderOpacity, glow, glowColor, lightAngle = 135, shadowDistance = 8, shadowOpacity = 0.1 } = el.glassmorphism;
        const bgRgba = hexToRgbaCSS(el.fill || '#ffffff', backgroundOpacity);
        const borderRgba = hexToRgbaCSS('#ffffff', borderOpacity);
        
        const rad = lightAngle * (Math.PI / 180);
        const shadowX = Math.cos(rad) * shadowDistance;
        const shadowY = Math.sin(rad) * shadowDistance;
        
        let shadow = '';
        if (glow && glow > 0) {
            shadow = `0 8px 32px 0 ${hexToRgbaCSS(glowColor || el.fill || '#ffffff', glow / 100)}, inset 0 0 0 1px ${borderRgba}`;
        } else {
            shadow = `${shadowX}px ${shadowY}px ${blur * 0.75}px rgba(0,0,0,${shadowOpacity}), inset 0 0 0 1px ${borderRgba}`;
        }
        
        styles += ` background: ${bgRgba}; backdrop-filter: blur(${blur}px); -webkit-backdrop-filter: blur(${blur}px); box-shadow: ${shadow}; border: 1px solid ${borderRgba};`;
      } else if (el.type !== 'text') {
        styles += ` background: ${el.fill || '#ffffff'};`;
      }

      if (el.type === 'text') {
        styles += ` color: ${el.color || el.fill || '#ffffff'}; font-size: ${el.fontSize}px; display: flex; align-items: center; justify-content: center;`;
      }

      const content = el.text ? `\n      <span>${el.text}</span>\n    ` : '';
      return `    <div style="${styles}">${content}</div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentProject.name}</title>
  <style>
    body { background: #0b1120; margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: system-ui, sans-serif; }
    .device-frame { position: relative; width: ${currentProject.width}px; height: ${currentProject.height}px; background: #1a1a2e; border-radius: 40px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .bg-circle-1 { position: absolute; top: 40px; left: -80px; width: 256px; height: 256px; background: #a855f7; border-radius: 50%; filter: blur(80px); mix-blend-mode: screen; opacity: 0.4; }
    .bg-circle-2 { position: absolute; bottom: 40px; right: -80px; width: 256px; height: 256px; background: #14b8a6; border-radius: 50%; filter: blur(80px); mix-blend-mode: screen; opacity: 0.4; }
  </style>
</head>
<body>
  <div class="device-frame">
    <!-- Decorative BGs -->
    <div class="bg-circle-1"></div>
    <div class="bg-circle-2"></div>
    
    <!-- Rendered UI Elements -->
${elementsHTML}
  </div>
</body>
</html>`;
  };

  const generateGodot = () => {
    let tscn = `[gd_scene load_steps=2 format=3]

[node name="MainUI" type="CanvasLayer"]

[node name="Container" type="Control" parent="."]
layout_mode = 3
anchors_preset = 15
anchor_right = 1.0
anchor_bottom = 1.0
grow_horizontal = 2
grow_vertical = 2\n\n`;

    currentProject.elements.forEach((el, index) => {
      const isCard = el.type.includes('glass');
      const isText = el.type === 'text';
      const nodeType = isText ? 'Label' : (isCard ? 'Panel' : 'ColorRect');
      const nodeName = el.name.replace(/\s+/g, '') + '_' + index;

      tscn += `[node name="${nodeName}" type="${nodeType}" parent="Container"]
offset_left = ${el.x}
offset_top = ${el.y}
offset_right = ${el.x + el.width}
offset_bottom = ${el.y + el.height}
`;
      if (isText && el.text) {
        tscn += `text = "${el.text}"\n`;
      }
      tscn += `\n`;
    });

    return tscn;
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportImage = async (format: 'png' | 'jpeg') => {
    const node = document.getElementById('export-canvas-frame');
    if (!node) {
      alert("Canvas wrapper not found.");
      return;
    }
    
    try {
      setIsExportingImage(true);
      // Brief delay to let ui settle
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = format === 'png' 
        ? await toPng(node, { cacheBust: true, pixelRatio: 2 })
        : await toJpeg(node, { cacheBust: true, pixelRatio: 2, quality: 0.95 });
        
      const link = document.createElement('a');
      link.download = `${currentProject.name}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image', err);
      alert('Failed to generate image from canvas.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const activeContent = activeTab === 'json' ? generateJSON() 
                      : activeTab === 'html' ? generateHTML() 
                      : activeTab === 'godot' ? generateGodot() 
                      : "Click the buttons below to export a high-quality raster image of your active artboard frame. Includes backgrounds, shadows, and text.";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${isDarkTheme ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between p-4 border-b border-inherit">
          <h2 className="text-lg font-bold">Export Project</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-500/20"><X size={20} /></button>
        </div>
        
        <div className="flex relative items-stretch h-[500px]">
          <div className="w-48 shrink-0 border-r border-inherit flex flex-col p-2 space-y-1">
            <TabButton active={activeTab === 'json'} onClick={() => setActiveTab('json')} icon={<FileJson size={16} />} label="JSON Project" desc="Backup & Share" />
            <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={<ImageIcon size={16} />} label="Image (PNG/JPG)" desc="Rendered Screenshot" />
            <TabButton active={activeTab === 'html'} onClick={() => setActiveTab('html')} icon={<LayoutTemplate size={16} />} label="Web (HTML/CSS)" desc="Static HTML" />
            <TabButton active={activeTab === 'godot'} onClick={() => setActiveTab('godot')} icon={<Code size={16} />} label="Godot (.tscn)" desc="Native UI Scene" />
          </div>
          
          <div className={`flex-1 p-4 relative ${isDarkTheme ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            <pre className={`w-full h-full p-4 rounded-lg overflow-auto text-xs font-mono border whitespace-pre-wrap ${isDarkTheme ? 'bg-[#1e293b] border-slate-700 text-teal-300' : 'bg-white border-slate-200 text-teal-700'}`}>
              {activeContent}
            </pre>
            
            <div className="absolute bottom-6 right-6 flex items-center space-x-2">
              {activeTab === 'image' ? (
                <>
                  <button 
                    onClick={() => handleExportImage('jpeg')}
                    disabled={isExportingImage}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700 text-white shadow-lg hover:bg-slate-600 font-medium disabled:opacity-50"
                  >
                    <Download size={18} />
                    <span>Download JPG</span>
                  </button>
                  <button 
                    onClick={() => handleExportImage('png')}
                    disabled={isExportingImage}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:opacity-90 font-medium disabled:opacity-50"
                  >
                    <Download size={18} />
                    <span>{isExportingImage ? 'Rendering...' : 'Download PNG'}</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handleDownloadFile(
                    activeContent, 
                    `${currentProject.name}.${activeTab === 'godot' ? 'tscn' : activeTab}`,
                    activeTab === 'json' ? 'application/json' : activeTab === 'html' ? 'text/html' : 'text/plain'
                  )}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:opacity-90 font-medium"
                >
                  <Download size={18} />
                  <span>Download File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, desc }: any) {
  const { isDarkTheme } = useUIStore();
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-start w-full p-3 rounded-lg text-left transition-colors ${
        active 
          ? (isDarkTheme ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200')
          : (isDarkTheme ? 'hover:bg-slate-800 border border-transparent' : 'hover:bg-slate-100 border border-transparent')
      }`}
    >
      <div className={`flex items-center space-x-2 text-sm font-semibold ${active ? 'text-purple-500' : 'text-slate-500'}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-[10px] text-slate-400 mt-1 pl-6">{desc}</div>
    </button>
  );
}
