import React, { useState } from 'react';
import { DocumentTemplate, DocumentProject, CanvasElement } from './types';
import CanvasEditor from './components/CanvasEditor';
import ProjectEditor from './components/ProjectEditor';
import HomePage from './components/HomePage';
import FontManager from './components/FontManager';
import TemplateManager from './components/TemplateManager';
import ProjectManager from './components/ProjectManager';
import LoginPage from './components/LoginPage';

// Preset Templates
const PRESET_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank_nota',
    name: 'Nota Kosong',
    type: 'blank',
    width: 600,
    height: 800,
    backgroundColor: '#ffffff',
    elements: []
  },
  {
    id: 'nota_minimalis',
    name: 'Nota Minimalis',
    type: 'nota',
    width: 600,
    height: 800,
    backgroundColor: '#ffffff',
    elements: [
       { id: 't1', type: 'text', content: 'NOTA PENJUALAN', x: 20, y: 20, width: 300, height: 40, fontFamily: 'font-sans', fontSize: 24, color: '#333333', textAlign: 'left', fontWeight: 'bold' }
    ]
  },
  {
    id: 'kwitansi_klasik',
    name: 'Kwitansi Klasik',
    type: 'kwitansi',
    width: 800,
    height: 400,
    backgroundColor: '#ffffff',
    elements: [
       { id: 't1', type: 'text', content: 'KWITANSI', x: 300, y: 20, width: 200, height: 40, fontFamily: 'font-serif', fontSize: 24, color: '#000000', textAlign: 'center', fontWeight: 'bold' },
       { id: 's1', type: 'shape', shapeType: 'line', x: 20, y: 70, width: 760, height: 2, strokeColor: '#000000', strokeWidth: 2 }
    ]
  }
];

export type ViewState = 'home' | 'login' | 'font-manager' | 'template-manager' | 'project-manager' | 'editor';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>(PRESET_TEMPLATES);
  const [projects, setProjects] = useState<DocumentProject[]>([]);
  const [activeItem, setActiveItem] = useState<{ type: 'template' | 'project', doc: DocumentTemplate | DocumentProject } | null>(null);

  React.useEffect(() => {
    // Inject Custom Fonts CSS globally
    const saved = localStorage.getItem('jagonota_custom_fonts');
    if (saved) {
      try {
        const fonts = JSON.parse(saved);
        const style = document.createElement('style');
        let css = '';
        fonts.forEach((f: any) => {
          if (f.cssText) {
             css += `.${f.value} { ${f.cssText} display: inline-block; }\n`;
          } else {
             // Fallback
             css += `.${f.value} { font-family: 'Indie Flower', cursive; letter-spacing: 1px; display: inline-block; }\n`;
          }
        });
        style.textContent = css;
        style.id = 'jagonota-custom-fonts-style';
        
        const existing = document.getElementById('jagonota-custom-fonts-style');
        if (existing) existing.remove();
        
        document.head.appendChild(style);
        
        // Ensure Google Fonts exist for the parsed fonts
        fonts.forEach((f: any) => {
           if (f.fontFamilyName && !document.getElementById('font-' + f.fontFamilyName.replace(/\s+/g, ''))) {
              const link = document.createElement('link');
              link.id = 'font-' + f.fontFamilyName.replace(/\s+/g, '');
              link.rel = 'stylesheet';
              link.href = `https://fonts.googleapis.com/css2?family=${f.fontFamilyName.replace(/\s+/g, '+')}&display=swap`;
              document.head.appendChild(link);
           }
        });
      } catch (e) {
         console.error('Error loading custom fonts', e);
      }
    }
  }, [view]);

  const handleNavigation = (targetView: ViewState) => {
    if (!isLoggedIn && targetView !== 'home') {
        setView('login');
    } else {
        setView(targetView);
    }
  };

  const startTemplateEditor = (template: DocumentTemplate, isNew: boolean = false) => {
    if (isNew) {
       setActiveItem({ type: 'template', doc: template });
       setTemplates(prev => [template, ...prev]);
    } else {
       setActiveItem({ type: 'template', doc: template });
    }
    setView('editor');
  };

  const startProjectEditor = (project: DocumentProject, isNew: boolean = false) => {
    if (isNew) {
      setActiveItem({ type: 'project', doc: project });
      setProjects(prev => [project, ...prev]);
    } else {
      setActiveItem({ type: 'project', doc: project });
    }
    setView('editor');
  }

  const handleUpdateActive = (updatedDoc: DocumentTemplate) => {
      if (!activeItem) return;
      
      if (activeItem.type === 'template') {
          setActiveItem({ type: 'template', doc: updatedDoc });
          setTemplates(prev => {
              const exists = prev.find(t => t.id === updatedDoc.id);
              if (exists) return prev.map(t => t.id === updatedDoc.id ? updatedDoc : t);
              return [updatedDoc, ...prev];
          });
      } else {
          const updatedProject = { ...(activeItem.doc as DocumentProject), document: updatedDoc };
          setActiveItem({ type: 'project', doc: updatedProject });
          setProjects(prev => {
              const exists = prev.find(p => p.id === updatedProject.id);
              if (exists) return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
              return [updatedProject, ...prev];
          });
      }
  };

  const handleDeleteTemplate = (id: string) => {
      setTemplates(prev => prev.filter(t => t.id !== id));
  };
  
  const handleRenameTemplate = (id: string, newName: string) => {
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const handleDeleteProject = (id: string) => {
      setProjects(prev => prev.filter(p => p.id !== id));
  };
  
  const handleRenameProject = (id: string, newName: string) => {
      setProjects(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const navigateBack = () => setView('home');

  if (view === 'editor' && activeItem) {
      if (activeItem.type === 'template') {
          return (
              <CanvasEditor 
                  template={activeItem.doc as DocumentTemplate} 
                  onUpdateTemplate={(doc) => handleUpdateActive(doc)}
                  onBack={() => setView('template-manager')}
              />
          );
      } else {
          return (
              <ProjectEditor 
                  project={activeItem.doc as DocumentProject} 
                  onUpdateProject={(proj) => {
                      setActiveItem({ type: 'project', doc: proj });
                      setProjects(prev => prev.map(p => p.id === proj.id ? proj : p));
                  }}
                  onBack={() => setView('project-manager')}
              />
          );
      }
  }

  if (view === 'login') return <LoginPage onLogin={() => { setIsLoggedIn(true); setView('home'); }} onBack={navigateBack} />;
  if (view === 'font-manager') return <FontManager onBack={navigateBack} />;
  if (view === 'template-manager') return <TemplateManager templates={templates} onStartEditor={startTemplateEditor} onDeleteTemplate={handleDeleteTemplate} onRenameTemplate={handleRenameTemplate} onBack={navigateBack} />;
  if (view === 'project-manager') return <ProjectManager projects={projects} templates={templates} onStartProject={startProjectEditor} onDeleteProject={handleDeleteProject} onRenameProject={handleRenameProject} onBack={navigateBack} />;

  return <HomePage onNavigate={handleNavigation} isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />;
}


