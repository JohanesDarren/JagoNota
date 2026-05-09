import React, { useState } from 'react';
import { DocumentTemplate, DocumentProject, CanvasElement } from './types';
import CanvasEditor from './components/CanvasEditor';
import ProjectEditor from './components/ProjectEditor';
import HomePage from './components/HomePage';
import FontManager from './components/FontManager';
import TemplateManager from './components/TemplateManager';
import ProjectManager from './components/ProjectManager';
import LoginPage from './components/LoginPage';
import { supabase } from './utils';

const sanitizeFontFamily = (name: string) =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');

const inferFontFormat = (url: string) => {
  if (url.endsWith('.woff2')) return 'woff2';
  if (url.endsWith('.woff')) return 'woff';
  if (url.endsWith('.ttf')) return 'truetype';
  if (url.endsWith('.otf')) return 'opentype';
  return 'woff2';
};

const buildCustomFontCss = (font: any, existingCssText?: string) => {
  if (existingCssText) return existingCssText;
  const family = `custom-font-${font.id}`;
  if (font.font_url) {
    const format = inferFontFormat(font.font_url);
    const lineHeight = font.line_spacing ?? 1;
    const letterSpacing = font.letter_spacing ?? 0;
    return `@font-face { font-family: '${family}'; src: url('${font.font_url}') format('${format}'); font-weight: normal; font-style: normal; }
.${family} { font-family: '${family}', sans-serif; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}px; }`;
  }
  return `.${family} { font-family: '${family}', sans-serif; line-height: ${font.line_spacing ?? 1}; letter-spacing: ${font.letter_spacing ?? 0}px; }`;
};

// Preset Templates
const PRESET_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank_nota',
    name: 'Nota Elegan',
    type: 'blank',
    width: 600,
    height: 800,
    backgroundColor: '#f8fafc',
    user_id: null,
    is_default: true,
    elements: [
      { id: 's1', type: 'shape', shapeType: 'rectangle', x: 20, y: 20, width: 560, height: 120, fillColor: '#2563eb', strokeColor: '#2563eb', strokeWidth: 0 },
      { id: 't1', type: 'text', content: 'NOTA ELEGAN', x: 30, y: 30, width: 520, height: 40, fontFamily: 'font-sans', fontSize: 28, color: '#ffffff', textAlign: 'left', fontWeight: 'bold' },
      { id: 't2', type: 'text', content: 'Toko Jago', x: 30, y: 70, width: 520, height: 24, fontFamily: 'font-sans', fontSize: 16, color: '#e2e8f0', textAlign: 'left' },
      { id: 's2', type: 'shape', shapeType: 'line', x: 20, y: 160, width: 560, height: 2, strokeColor: '#cbd5e1', strokeWidth: 1 }
    ]
  },
  {
    id: 'nota_modern',
    name: 'Nota Modern',
    type: 'nota',
    width: 600,
    height: 800,
    backgroundColor: '#ffffff',
    user_id: null,
    is_default: true,
    elements: [
       { id: 't3', type: 'text', content: 'NOTA PENJUALAN', x: 30, y: 30, width: 540, height: 40, fontFamily: 'font-sans', fontSize: 26, color: '#111827', textAlign: 'left', fontWeight: 'bold' },
       { id: 't4', type: 'text', content: 'Nama Toko • Alamat • Kontak', x: 30, y: 75, width: 540, height: 22, fontFamily: 'font-sans', fontSize: 14, color: '#6b7280', textAlign: 'left' },
       { id: 's3', type: 'shape', shapeType: 'rectangle', x: 30, y: 110, width: 540, height: 80, fillColor: '#f3f4f6', strokeColor: '#e5e7eb', strokeWidth: 1 },
       { id: 't5', type: 'text', content: 'Rincian Pesanan', x: 40, y: 120, width: 520, height: 22, fontFamily: 'font-sans', fontSize: 16, color: '#111827', textAlign: 'left', fontWeight: 'bold' },
       { id: 's4', type: 'shape', shapeType: 'line', x: 30, y: 210, width: 540, height: 2, strokeColor: '#e5e7eb', strokeWidth: 1 }
    ]
  },
  {
    id: 'kwitansi_klasik',
    name: 'Kwitansi Profesional',
    type: 'kwitansi',
    width: 800,
    height: 400,
    backgroundColor: '#f8fafc',
    user_id: null,
    is_default: true,
    elements: [
       { id: 't6', type: 'text', content: 'KWITANSI', x: 310, y: 20, width: 180, height: 40, fontFamily: 'font-serif', fontSize: 28, color: '#111827', textAlign: 'center', fontWeight: 'bold' },
       { id: 's5', type: 'shape', shapeType: 'line', x: 40, y: 70, width: 720, height: 2, strokeColor: '#0f172a', strokeWidth: 2 },
       { id: 't7', type: 'text', content: 'Telah Terima Dari', x: 40, y: 100, width: 180, height: 22, fontFamily: 'font-sans', fontSize: 14, color: '#475569', textAlign: 'left' },
       { id: 's6', type: 'shape', shapeType: 'rectangle', x: 230, y: 98, width: 530, height: 26, fillColor: '#ffffff', strokeColor: '#cbd5e1', strokeWidth: 1 },
       { id: 't8', type: 'text', content: 'Jumlah', x: 40, y: 150, width: 100, height: 22, fontFamily: 'font-sans', fontSize: 14, color: '#475569', textAlign: 'left' },
       { id: 's7', type: 'shape', shapeType: 'rectangle', x: 230, y: 148, width: 530, height: 26, fillColor: '#ffffff', strokeColor: '#cbd5e1', strokeWidth: 1 }
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          
          // Fetch templates (user's templates and default app templates)
          const { data: templatesData } = await supabase
            .from('templates')
            .select('*')
            .or(`user_id.eq.${user.id},user_id.is.null,is_default.eq.true`);
            
          if (templatesData) {
            const loadedTemplates = templatesData.map(t => ({
              ...t.layout_data,
              id: t.layout_data.id || `tmpl_${Date.now()}_${Math.random()}`,
              db_id: t.id,
              user_id: t.user_id,
              is_default: t.is_default ?? t.user_id == null
            })) as DocumentTemplate[];
            
            const hasAppTemplates = loadedTemplates.some(t => t.user_id == null || t.is_default);
            setTemplates(hasAppTemplates ? loadedTemplates : [...PRESET_TEMPLATES, ...loadedTemplates]);
          } else {
            setTemplates(PRESET_TEMPLATES);
          }

          // Fetch projects
          const { data: projectsData } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id);
            
          if (projectsData) {
             const loadedProjects = projectsData.map(p => ({
                 ...p.content,
                 id: p.content.id || `proj_${Date.now()}_${Math.random()}`
             })) as DocumentProject[];
             setProjects(loadedProjects);
          }

          const { data: fontRows, error: fontError } = await supabase
            .from('fonts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

          if (!fontError && fontRows) {
              const savedLocalFonts = JSON.parse(localStorage.getItem('jagonota_custom_fonts') || '[]');
              const customFonts = fontRows.map((f: any) => {
                  const existing = Array.isArray(savedLocalFonts)
                    ? savedLocalFonts.find((font: any) => font.id === f.id)
                    : null;

                  return {
                      id: f.id,
                      label: f.name,
                      value: `custom-font-${f.id}`,
                      isCustom: true,
                      cssText: buildCustomFontCss(f, existing?.cssText),
                      fontFamilyName: existing?.fontFamilyName || sanitizeFontFamily(f.name) || `custom-font-${f.id}`,
                      font_url: f.font_url,
                      lineSpacing: f.line_spacing,
                      letterSpacing: f.letter_spacing,
                      user_id: f.user_id,
                      created_at: f.created_at
                  };
              });
              localStorage.setItem('jagonota_custom_fonts', JSON.stringify(customFonts));
          }
        }
      };
      fetchData();
    } else {
      setCurrentUserId(null);
      setTemplates([]);
      setProjects([]);
    }
  }, [isLoggedIn]);

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
    // Allow opening app templates (default templates) for edit, but require save-as-new on save.
    const isAppTemplate = template.user_id == null || template.is_default;
    if (!isNew && !isAppTemplate && template.user_id !== currentUserId) {
      alert('Anda tidak memiliki akses ke template ini.');
      return;
    }

    const templateCopy = JSON.parse(JSON.stringify(template)) as DocumentTemplate;
    if (isAppTemplate) {
      // Give a unique draft id so it doesn't conflict with the original preset
      templateCopy.id = `${template.id}_draft_${Date.now()}`;
      delete templateCopy.db_id;
      templateCopy.user_id = currentUserId || null;
      delete templateCopy.is_default;
    }

    // Pre-add to state so editor has it; handleUpdateActive will update it in-place on save
    setActiveItem({ type: 'template', doc: templateCopy });
    setTemplates(prev => {
      // Avoid true duplicates (same id already in list)
      if (prev.find(t => t.id === templateCopy.id)) return prev;
      return [templateCopy, ...prev];
    });
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
              // Match by id first, then by db_id as fallback (in case the id changed after save)
              const existsById = prev.find(t => t.id === updatedDoc.id);
              const existsByDbId = updatedDoc.db_id ? prev.find(t => t.db_id === updatedDoc.db_id) : null;
              const activeDoc = activeItem.doc as DocumentTemplate;
              const existsByActiveId = prev.find(t => t.id === activeDoc.id);
              
              if (existsById) {
                return prev.map(t => t.id === updatedDoc.id ? updatedDoc : t);
              } else if (existsByDbId) {
                return prev.map(t => t.db_id === updatedDoc.db_id ? updatedDoc : t);
              } else if (existsByActiveId) {
                // Active item id changed (app template draft), replace the draft
                return prev.map(t => t.id === activeDoc.id ? updatedDoc : t);
              }
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

  const handleDeleteTemplate = async (id: string) => {
    try {
      const template = templates.find(t => t.id === id);
      if (!template || template.user_id !== currentUserId) {
        alert('Anda tidak memiliki akses untuk menghapus template ini.');
        return;
      }
      
      if (template.db_id) {
        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('id', template.db_id)
          .eq('user_id', currentUserId); // Extra safety check
        
        if (error) throw error;
      }
      
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert('Gagal menghapus template: ' + err.message);
    }
  };
  
  const handleRenameTemplate = async (id: string, newName: string) => {
    try {
      const template = templates.find(t => t.id === id);
      if (!template || template.user_id !== currentUserId) {
        alert('Anda tidak memiliki akses untuk mengubah nama template ini.');
        return;
      }
      
      if (template.db_id) {
        const { error } = await supabase
          .from('templates')
          .update({ name: newName.trim() })
          .eq('id', template.db_id)
          .eq('user_id', currentUserId); // Extra safety check
        
        if (error) throw error;
      }
      
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
    } catch (err: any) {
      alert('Gagal mengubah nama template: ' + err.message);
    }
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
                  onBack={() => {
                    // Clean up unsaved drafts (no db_id) when going back
                    const activeDoc = activeItem.doc as DocumentTemplate;
                    if (!activeDoc.db_id) {
                      setTemplates(prev => prev.filter(t => t.id !== activeDoc.id));
                    }
                    setView('template-manager');
                  }}
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
  if (view === 'template-manager') return <TemplateManager templates={templates} currentUserId={currentUserId} onStartEditor={startTemplateEditor} onDeleteTemplate={handleDeleteTemplate} onRenameTemplate={handleRenameTemplate} onBack={navigateBack} />;
  if (view === 'project-manager') return <ProjectManager projects={projects} templates={templates} onStartProject={startProjectEditor} onDeleteProject={handleDeleteProject} onRenameProject={handleRenameProject} onBack={navigateBack} />;

  return <HomePage onNavigate={handleNavigation} isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />;
}


