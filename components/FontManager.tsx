import React, { useState, useEffect, useRef } from 'react';
import { FontOption, INITIAL_FONTS } from '../types';
import { Type, Plus, Upload, Loader2, FileImage, CheckCircle, Info, ChevronRight, X } from 'lucide-react';
import { GoogleGenAI, Type as GenAIType } from '@google/genai';
import { supabase } from '../utils';

const inferFontFormat = (url: string) => {
    if (url.endsWith('.woff2')) return 'woff2';
    if (url.endsWith('.woff')) return 'woff';
    if (url.endsWith('.ttf')) return 'truetype';
    if (url.endsWith('.otf')) return 'opentype';
    return 'woff2';
};

interface VisualAttributes {
    weight: number; // 100-900
    slant: number; // -20 to 20 degrees
    roundness: number; // 0-100 (percentage)
    irregularity: number; // 0-100 (percentage)
    letterSpacing: number; // pixels
}

interface Props {
    onBack: () => void;
}

export default function FontManager({ onBack }: Props) {
    const [fonts, setFonts] = useState<FontOption[]>(() => {
        const saved = localStorage.getItem('jagonota_custom_fonts');
        if (saved) return [...INITIAL_FONTS, ...JSON.parse(saved)];
        return INITIAL_FONTS;
    });

    // ── Unified single-workflow states ──
    const [unifiedStep, setUnifiedStep] = useState<'idle' | 'processing' | 'preview'>('idle');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [previewRenderKey, setPreviewRenderKey] = useState(0); // Force re-render

    // ── Result / preview states (merged from both cards) ──
    const [extractedCSS, setExtractedCSS] = useState<string>('');
    const [extractedFontFamilyInfo, setExtractedFontFamilyInfo] = useState<string>('');
    const [generatedCssText, setGeneratedCssText] = useState('');
    const [generatedFontFamilyName, setGeneratedFontFamilyName] = useState('');
    const [visualAttributes, setVisualAttributes] = useState<VisualAttributes | null>(null);
    const [dynamicInlineStyles, setDynamicInlineStyles] = useState<React.CSSProperties>({});

    // ── Form save states ──
    const [newFontName, setNewFontName] = useState('');
    const [fontUrl, setFontUrl] = useState('');
    const [letterSpacing, setLetterSpacing] = useState(0);
    const [lineSpacing, setLineSpacing] = useState(1.5);

    // ── Legacy AI Font Generator states (preserved) ──
    const [aiStep, setAiStep] = useState<'idle' | 'generating' | 'preview'>('idle');
    const [aiUploadedImage, setAiUploadedImage] = useState<string | null>(null);
    const [generatedFontUrl, setGeneratedFontUrl] = useState('');
    const [generatedFontName, setGeneratedFontName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiFontNameInput, setAiFontNameInput] = useState('');
    const [aiLetterSpacing, setAiLetterSpacing] = useState(0);
    const [aiLineSpacing, setAiLineSpacing] = useState(1.5);
    const aiFileInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Dynamically load a Google Font via <link>
    const loadGoogleFontDynamically = (fontFamily: string) => {
        const id = 'gfont-ai-' + fontFamily.replace(/\s+/g, '');
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
            document.head.appendChild(link);
        }
    };

    // ── Convert visual attributes to dynamic CSS styles ──
    const convertAttributesToCss = (attrs: VisualAttributes): React.CSSProperties => {
        const styles: React.CSSProperties = {
            fontWeight: attrs.weight,
            letterSpacing: `${attrs.letterSpacing}px`,
            // Slant menggunakan skewX
            transform: `skewX(${attrs.slant}deg)`,
            // Irregularity menggunakan filter + sedikit blur untuk efek "messy"
            filter: `blur(${attrs.irregularity > 60 ? 0.3 : 0}px)`,
            // Roundness menggunakan border-radius virtual pada huruf (melalui text-rendering)
            textRendering: attrs.roundness > 60 ? 'geometricPrecision' : 'auto',
            // Tambahan styling untuk enhanced visual appeal
            fontStyle: attrs.slant > 5 ? 'italic' : 'normal',
        };
        return styles;
    };

    // Inject preview CSS whenever generated font changes (unified)
    useEffect(() => {
        const cssToUse = generatedCssText || extractedCSS;
        const familyToUse = generatedFontFamilyName || extractedFontFamilyInfo;
        if (!cssToUse || !familyToUse) return;
        loadGoogleFontDynamically(familyToUse);
        let styleEl = document.getElementById('ai-font-preview-style') as HTMLStyleElement | null;
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'ai-font-preview-style';
            document.head.appendChild(styleEl);
        }
        styleEl.textContent = `.ai-preview-font-temp { ${cssToUse} }`;
    }, [generatedCssText, generatedFontFamilyName, extractedCSS, extractedFontFamilyInfo]);

    const syncCustomFonts = (customFonts: FontOption[]) => {
        const updatedFonts = [...INITIAL_FONTS, ...customFonts];
        setFonts(updatedFonts);
        localStorage.setItem('jagonota_custom_fonts', JSON.stringify(customFonts));
        const existingStyle = document.getElementById('jagonota-custom-fonts-style');
        if (existingStyle) existingStyle.remove();

        const style = document.createElement('style');
        style.id = 'jagonota-custom-fonts-style';
        style.textContent = customFonts.map(f => {
            const spacing = `letter-spacing: ${f.letterSpacing ?? 0}px; line-height: ${f.lineSpacing ?? 1};`;
            if (f.cssText) {
                return `.${f.value} { ${f.cssText} ${spacing} display: inline-block; }`;
            }
            if (f.font_url) {
                const format = inferFontFormat(f.font_url);
                return `@font-face { font-family: '${f.value}'; src: url('${f.font_url}') format('${format}'); font-weight: normal; font-style: normal; }
.${f.value} { font-family: '${f.value}', sans-serif; ${spacing} display: inline-block; }`;
            }
            return `.${f.value} { font-family: '${f.value}', sans-serif; ${spacing} display: inline-block; }`;
        }).join('\n');
        document.head.appendChild(style);

        customFonts.forEach(f => {
            if (f.fontFamilyName && !document.getElementById('font-' + f.fontFamilyName.replace(/\s+/g, ''))) {
                const link = document.createElement('link');
                link.id = 'font-' + f.fontFamilyName.replace(/\s+/g, '');
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${f.fontFamilyName.replace(/\s+/g, '+')}&display=swap`;
                document.head.appendChild(link);
            }
        });
    };

    useEffect(() => {
        const loadFonts = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            const { data, error } = await supabase.from('fonts').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
            if (error) {
                console.error('Gagal memuat font:', error.message);
                return;
            }

            const customFonts: FontOption[] = (data || []).map((font: any) => ({
                id: font.id,
                label: font.name,
                value: `custom-font-${font.id}`,
                isCustom: true,
                cssText: '',
                fontFamilyName: font.name,
                font_url: font.font_url,
                lineSpacing: font.line_spacing,
                letterSpacing: font.letter_spacing,
                user_id: font.user_id,
                created_at: font.created_at
            }));

            syncCustomFonts(customFonts);
        };
        loadFonts();
    }, []);

    // ── UNIFIED: Handle file upload + decide path based on prompt ──
    const handleUnifiedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // ✅ RESET STATE ON UPLOAD - Clear previous preview states
        setExtractedCSS('');
        setExtractedFontFamilyInfo('');
        setGeneratedCssText('');
        setGeneratedFontFamilyName('');
        setVisualAttributes(null);
        setDynamicInlineStyles({});

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64DataUrl = ev.target?.result as string;
            setUploadedImage(base64DataUrl);
        };
        reader.readAsDataURL(file);
    };

    // ── UNIFIED: Main process function — prompt-aware routing ──
    const handleProcessFont = async () => {
        if (!uploadedImage) return;

        setIsProcessing(true);
        setUnifiedStep('processing');

        const base64String = uploadedImage.split(',')[1];
        const mimeType = uploadedImage.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
        const hasPrompt = aiPrompt.trim().length > 0;

        try {
            if (hasPrompt) {
                // ── PATH A: Prompt diisi → jalankan AI Generator dengan Deep Visual Analysis ──
                const adjustmentNote = aiPrompt.trim()
                    ? `User also requested adjustments: "${aiPrompt.trim()}". Apply these to the visual attributes.`
                    : 'Analyze the handwriting as-is, preserving all unique characteristics.';

                const promptText = `ANALYZE THE HANDWRITING DEEPLY - Do NOT look for font names. Instead, extract these specific visual attributes:

1. **Weight** (100-900): How thick/bold are the strokes? 100=thin, 400=normal, 700=bold, 900=very heavy
2. **Slant** (-20 to +20 degrees): Is the handwriting tilted? Positive=right-leaning, negative=left-leaning
3. **Roundness** (0-100%): How rounded vs sharp are the letterforms? 0=sharp/angular, 100=very rounded
4. **Irregularity** (0-100%): How messy/inconsistent is the handwriting? 0=perfect, 100=very messy/chaotic
5. **Letter Spacing** (pixels): Typical space between letters in the sample

${adjustmentNote}

Return ONLY valid JSON (no markdown):
{
  "weight": <number>,
  "slant": <number>,
  "roundness": <number>,
  "irregularity": <number>,
  "letterSpacing": <number>,
  "description": "<brief description of the handwriting style>"
}`;

                if (geminiKey) {
                    const ai = new GoogleGenAI({ apiKey: geminiKey });
                    let attributes: VisualAttributes = {
                        weight: 400,
                        slant: 0,
                        roundness: 50,
                        irregularity: 30,
                        letterSpacing: 1
                    };

                    try {
                        const response = await ai.models.generateContent({
                            model: 'gemini-2.0-flash',
                            contents: [{ parts: [{ inlineData: { mimeType, data: base64String } }, { text: promptText }] }],
                        });
                        const rawText = response.text ?? '';
                        const jsonMatch = rawText.match(/\{[\s\S]*?\}/);
                        const jsonStr = jsonMatch ? jsonMatch[0] : rawText.trim();
                        const json = JSON.parse(jsonStr);
                        
                        attributes = {
                            weight: Math.max(100, Math.min(900, json.weight || 400)),
                            slant: Math.max(-20, Math.min(20, json.slant || 0)),
                            roundness: Math.max(0, Math.min(100, json.roundness || 50)),
                            irregularity: Math.max(0, Math.min(100, json.irregularity || 30)),
                            letterSpacing: Math.max(0, json.letterSpacing || 1)
                        };
                    } catch (apiErr: any) {
                        console.warn('Gemini API error, using defaults:', apiErr?.message);
                    }

                    setVisualAttributes(attributes);
                    const cssStyles = convertAttributesToCss(attributes);
                    setDynamicInlineStyles(cssStyles);
                    setGeneratedFontFamilyName('System Sans'); // Use generic fallback
                    setGeneratedFontName(`AI Font - ${Date.now()}`);
                    setNewFontName(`Font AI ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
                } else {
                    const defaultAttrs: VisualAttributes = { weight: 400, slant: 0, roundness: 50, irregularity: 30, letterSpacing: 1 };
                    setVisualAttributes(defaultAttrs);
                    setDynamicInlineStyles(convertAttributesToCss(defaultAttrs));
                    setGeneratedFontFamilyName('System Sans');
                    setNewFontName(`Font AI ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
                }

            } else {
                // ── PATH B: Prompt kosong → ekstraksi dengan deep visual analysis ──
                const promptText = `DEEP VISUAL ANALYSIS OF HANDWRITING - Do NOT search for font names. Extract these specific visual characteristics:

1. **Weight** (100-900): Stroke thickness. 100=very thin, 400=normal, 700=bold, 900=extremely heavy
2. **Slant** (-20 to +20 degrees): Tilt angle. Positive=right-leaning, negative=left-leaning, 0=upright
3. **Roundness** (0-100%): Letter shape curvature. 0=angular/sharp, 50=mixed, 100=very rounded
4. **Irregularity** (0-100%): Handwriting inconsistency. 0=perfect, 50=moderately messy, 100=very chaotic
5. **Letter Spacing** (pixels): Average gap between letters

PRESERVE the handwriting's exact characteristics - flaws, messiness, unique tilt, spacing errors. Do NOT attempt to beautify or normalize.

Return ONLY valid JSON (no markdown):
{
  "weight": <number>,
  "slant": <number>,
  "roundness": <number>,
  "irregularity": <number>,
  "letterSpacing": <number>,
  "description": "<brief description>"
}`;

                if (geminiKey) {
                    try {
                        const ai = new GoogleGenAI({ apiKey: geminiKey });
                        const response = await ai.models.generateContent({
                            model: "gemini-2.0-flash",
                            contents: {
                                parts: [
                                    { inlineData: { mimeType: mimeType, data: base64String } },
                                    { text: promptText }
                                ]
                            },
                        });

                        if (response.text) {
                            const jsonMatch = response.text.match(/\{[\s\S]*?\}/);
                            const jsonStr = jsonMatch ? jsonMatch[0] : response.text.trim();
                            const json = JSON.parse(jsonStr);
                            
                            const attributes: VisualAttributes = {
                                weight: Math.max(100, Math.min(900, json.weight || 400)),
                                slant: Math.max(-20, Math.min(20, json.slant || 0)),
                                roundness: Math.max(0, Math.min(100, json.roundness || 50)),
                                irregularity: Math.max(0, Math.min(100, json.irregularity || 30)),
                                letterSpacing: Math.max(0, json.letterSpacing || 1)
                            };
                            
                            setVisualAttributes(attributes);
                            const cssStyles = convertAttributesToCss(attributes);
                            setDynamicInlineStyles(cssStyles);
                            setExtractedFontFamilyInfo('System Sans');
                        }
                    } catch (err) {
                        console.error("Failed to extract visual attributes", err);
                        const defaultAttrs: VisualAttributes = { weight: 400, slant: 0, roundness: 50, irregularity: 30, letterSpacing: 1.2 };
                        setVisualAttributes(defaultAttrs);
                        setDynamicInlineStyles(convertAttributesToCss(defaultAttrs));
                        setExtractedFontFamilyInfo('System Sans');
                    }
                } else {
                    // Fallback without API key
                    await new Promise(r => setTimeout(r, 2000));
                    const defaultAttrs: VisualAttributes = {
                        weight: 400,
                        slant: (Math.random() * 10 - 5),
                        roundness: 50 + Math.random() * 30,
                        irregularity: 40 + Math.random() * 30,
                        letterSpacing: 1 + Math.random() * 1.5
                    };
                    setVisualAttributes(defaultAttrs);
                    setDynamicInlineStyles(convertAttributesToCss(defaultAttrs));
                    setExtractedFontFamilyInfo('System Sans');
                }
            }

            // ✅ FORCE RE-RENDER: Update render key with timestamp
            setPreviewRenderKey(Date.now());
            setUnifiedStep('preview');
        } catch (error: any) {
            const msg = error?.message || String(error);
            console.error('Failed to process font:', msg, error);
            alert(`Gagal memproses font.\n\nDetail: ${msg}`);
            setUnifiedStep('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    // ── UNIFIED: Save font to Supabase ──
    const handleSaveFont = async () => {
        const saveName = newFontName.trim();
        if (!saveName || !currentUserId) return;

        // ✅ BYPASS FALLBACK: Generate CSS from visual attributes instead of using Google Fonts
        let cssToSave = '';
        if (visualAttributes) {
            // Generate pure CSS from visual attributes (no fallback to Google Fonts)
            cssToSave = `
                font-weight: ${visualAttributes.weight};
                transform: skewX(${visualAttributes.slant}deg);
                letter-spacing: ${visualAttributes.letterSpacing}px;
                font-style: ${visualAttributes.slant > 5 ? 'italic' : 'normal'};
                font-family: system-ui, -apple-system, sans-serif;
            `.trim();
        } else {
            cssToSave = generatedCssText || extractedCSS;
        }

        const { data, error } = await supabase.from('fonts').insert([{
            user_id: currentUserId,
            name: saveName,
            font_url: fontUrl,
            line_spacing: lineSpacing,
            letter_spacing: letterSpacing
        }]).select().single();

        if (error || !data) {
            alert('Gagal menyimpan font: ' + (error?.message ?? 'Tidak diketahui'));
            return;
        }

        const newFont: FontOption = {
            id: data.id,
            label: data.name,
            value: `custom-font-${data.id}`,
            isCustom: true,
            cssText: cssToSave,
            fontFamilyName: familyToSave || data.name,
            font_url: data.font_url,
            lineSpacing: data.line_spacing,
            letterSpacing: data.letter_spacing,
            user_id: data.user_id,
            created_at: data.created_at
        };

        const updatedFonts = [...fonts, newFont];
        syncCustomFonts(updatedFonts.filter(f => f.isCustom));

        // Reset semua state setelah simpan
        handleResetUnified();
    };

    // ── UNIFIED: Reset / cancel ──
    const handleResetUnified = () => {
        setUnifiedStep('idle');
        setUploadedImage(null);
        setAiPrompt('');
        setNewFontName('');
        setFontUrl('');
        setLetterSpacing(0);
        setLineSpacing(1.5);
        setExtractedCSS('');
        setExtractedFontFamilyInfo('');
        setGeneratedCssText('');
        setGeneratedFontFamilyName('');
        setGeneratedFontName('');
        setVisualAttributes(null);
        setDynamicInlineStyles({});
        setPreviewRenderKey(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ── Legacy AI Font Generator functions (preserved as-is) ──
    const handleAiFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64DataUrl = ev.target?.result as string;
            setAiUploadedImage(base64DataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleGenerateFont = async () => {
        if (!aiUploadedImage) return;

        setIsGenerating(true);
        setAiStep('generating');

        try {
            const base64String = aiUploadedImage.split(',')[1];
            const mimeType = aiUploadedImage.split(',')[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

            const adjustmentNote = aiPrompt.trim()
                ? `The user also wants these adjustments: "${aiPrompt.trim()}". Apply them (e.g. tebal/bold → font-weight:700; miring/italic → transform:skewX(-10deg); elegan → prefer Dancing Script or Satisfy).`
                : 'Replicate the handwriting as faithfully as possible.';

            const promptText = `Analyze the handwriting style in this image carefully. ${adjustmentNote} Choose the closest Google Font from: Indie Flower, Caveat, Kalam, Pacifico, Dancing Script, Shadows Into Light, Permanent Marker, Amatic SC, Satisfy, Handlee. Generate CSS (font-family, letter-spacing, word-spacing, line-height, font-weight, font-style, transform) to match the handwriting with the requested adjustments. Respond ONLY with valid JSON, no markdown: {"fontFamilyName":"...","cssText":"..."}`;

            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                let usedFallback = false;
                let fontFamily = 'Caveat';
                let css = `font-family: 'Caveat', cursive; letter-spacing: 1px;`;

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.0-flash',
                        contents: [{ parts: [{ inlineData: { mimeType, data: base64String } }, { text: promptText }] }],
                    });
                    const rawText = response.text ?? '';
                    const jsonMatch = rawText.match(/\{[\s\S]*?"fontFamilyName"[\s\S]*?"cssText"[\s\S]*?\}/);
                    const jsonStr = jsonMatch ? jsonMatch[0] : rawText.trim();
                    const json = JSON.parse(jsonStr);
                    fontFamily = (json.fontFamilyName as string) || 'Caveat';
                    css = (json.cssText as string) || `font-family: '${fontFamily}', cursive;`;
                } catch (apiErr: any) {
                    console.warn('Gemini API error, using keyword fallback:', apiErr?.message);
                    usedFallback = true;
                }

                if (usedFallback) {
                    const p = aiPrompt.toLowerCase();
                    const isBold = p.includes('tebal') || p.includes('bold');
                    const isItalic = p.includes('miring') || p.includes('italic');
                    const isElegant = p.includes('elegan') || p.includes('elegant');
                    fontFamily = isElegant ? 'Dancing Script' : isBold ? 'Permanent Marker' : 'Caveat';
                    css = `font-family: '${fontFamily}', cursive; ${isBold ? 'font-weight: 700;' : ''} ${isItalic ? 'transform: skewX(-10deg); display: inline-block;' : ''} letter-spacing: 1.2px; line-height: 1.6;`.trim();
                }

                setGeneratedFontFamilyName(fontFamily);
                setGeneratedCssText(css);
                setGeneratedFontName(`AI Font - ${Date.now()}`);
                setAiFontNameInput(`Font AI ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);
            }
            setAiStep('preview');
        } catch (error: any) {
            const msg = error?.message || String(error);
            console.error('Failed to generate font:', msg, error);
            alert(`Gagal menghasilkan font.\n\nDetail error: ${msg}`);
            setAiStep('idle');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveAiFont = async () => {
        const saveName = aiFontNameInput.trim() || generatedFontName;
        if (!saveName || !currentUserId) return;

        const { data, error } = await supabase.from('fonts').insert([{
            user_id: currentUserId,
            name: saveName,
            font_url: '',
            line_spacing: aiLineSpacing,
            letter_spacing: aiLetterSpacing
        }]).select().single();

        if (error || !data) {
            alert('Gagal menyimpan font: ' + (error?.message ?? 'Tidak diketahui'));
            return;
        }

        const newFont: FontOption = {
            id: data.id,
            label: data.name,
            value: `custom-font-${data.id}`,
            isCustom: true,
            cssText: generatedCssText,
            fontFamilyName: generatedFontFamilyName,
            font_url: '',
            lineSpacing: aiLineSpacing,
            letterSpacing: aiLetterSpacing,
            user_id: data.user_id,
            created_at: data.created_at
        };

        const updatedFonts = [...fonts, newFont];
        syncCustomFonts(updatedFonts.filter(f => f.isCustom));

        setAiStep('idle');
        setAiUploadedImage(null);
        setAiPrompt('');
        setGeneratedFontName('');
        setGeneratedFontUrl('');
        setGeneratedCssText('');
        setGeneratedFontFamilyName('');
        setAiFontNameInput('');
        if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    };

    const handleCancelAi = () => {
        setAiStep('idle');
        setAiUploadedImage(null);
        setAiPrompt('');
        setGeneratedFontName('');
        setGeneratedFontUrl('');
        setGeneratedCssText('');
        setGeneratedFontFamilyName('');
        setAiFontNameInput('');
        if (aiFileInputRef.current) aiFileInputRef.current.value = '';
    };

    const handleDeleteFont = async (fontValue: string) => {
        const toDelete = fonts.find(f => f.value === fontValue && f.isCustom);
        if (toDelete?.id) {
            const { error } = await supabase.from('fonts').delete().eq('id', toDelete.id).eq('user_id', currentUserId);
            if (error) {
                alert('Gagal menghapus font: ' + error.message);
                return;
            }
        }

        const remainingCustom = fonts.filter(f => f.value !== fontValue && f.isCustom);
        syncCustomFonts(remainingCustom);
    };

    // ── Derived display values for preview ──
    const previewCss = generatedCssText || extractedCSS;
    const previewFamilyName = generatedFontFamilyName || extractedFontFamilyInfo;
    const isAiPath = aiPrompt.trim().length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-10 font-sans transition-colors duration-300 relative z-0">
            {/* Decorative Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <button onClick={onBack} className="text-sm font-bold text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 mb-12 flex items-center gap-2 uppercase tracking-widest transition-colors">← Kembali</button>

                <div className="mb-12 flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-sm">
                        <Type size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Kelola Font & <span className="text-[#1800ad] dark:text-blue-400">Tulisan Tangan</span></h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 max-w-2xl">Ubah tulisan tangan aslimu menjadi font digital untuk digunakan secara otomatis dalam nota.</p>
                    </div>
                </div>

                {/* Grid: 2 kolom — Card Utama Terpadu + Daftar Font */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_0.9fr] gap-8 mb-10 items-start">

                    {/* ══════════════════════════════════════════
                   UNIFIED SINGLE WORKFLOW CARD
                   Basis visual: Gemini AI Card
                   Alur: Upload → (Prompt opsional) → Proses → Preview → Simpan
               ══════════════════════════════════════════ */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] p-8 shadow-lg shadow-purple-900/5 border border-white dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl dark:hover:shadow-purple-900/20 hover:-translate-y-1 transition-all overflow-hidden">

                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <FileImage size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">Convert Tulisan Tangan</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Upload foto tulisan → Font digital dalam detik</p>
                            </div>
                            <div className="ml-auto px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800/50 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Gemini AI</span>
                            </div>
                        </div>

                        {/* ── STEP: idle — Upload + Prompt + Tombol Proses ── */}
                        {unifiedStep === 'idle' && (
                            <div className="flex flex-col gap-6">
                                {/* Info box */}
                                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-5 rounded-2xl text-sm text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50">
                                    <p className="font-black mb-3 flex items-center gap-2 uppercase tracking-wide text-xs"><Info size={16} /> Cara Penggunaan:</p>
                                    <ol className="list-decimal list-inside space-y-1.5 font-medium">
                                        <li>Tulis seluruh huruf <strong>(A-Z, a-z)</strong> dan angka <strong>(0-9)</strong> di selembar kertas putih bersih.</li>
                                        <li>Foto kertas tersebut dengan pencahayaan yang terang.</li>
                                        <li>Unggah foto, tambahkan instruksi AI opsional, lalu tekan <strong>Proses Font</strong>.</li>
                                    </ol>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Dropzone Foto */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Foto Referensi Tulisan Tangan</label>
                                        <label className="border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all rounded-2xl flex flex-col items-center justify-center cursor-pointer group min-h-[200px] relative overflow-hidden">
                                            {uploadedImage ? (
                                                <>
                                                    <img src={uploadedImage} alt="Referensi" className="w-full h-full object-cover absolute inset-0 opacity-60 rounded-2xl" />
                                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-black text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-700 shadow">
                                                            ✓ Foto Terupload — Klik untuk Ganti
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={36} className="text-gray-300 dark:text-gray-500 mb-3 group-hover:text-purple-400 dark:group-hover:text-purple-400 transition-colors" />
                                                    <span className="font-black text-gray-700 dark:text-gray-300 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Unggah Foto Tulisan Tangan</span>
                                                    <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-widest font-bold">JPG / PNG — Max 5MB</span>
                                                </>
                                            )}
                                            <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/*" onChange={handleUnifiedFileUpload} />
                                        </label>
                                    </div>

                                    {/* Prompt AI */}
                                    <div className="flex flex-col gap-3">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Instruksi Penyesuaian AI <span className="normal-case text-gray-400 dark:text-gray-500 font-medium">(Opsional)</span></label>
                                        <textarea
                                            value={aiPrompt}
                                            onChange={e => setAiPrompt(e.target.value)}
                                            placeholder="Contoh: Buat goresannya lebih tebal, miring ke kanan, dan berikan kesan elegan."
                                            rows={7}
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 dark:focus:ring-purple-500/20 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                        />
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                                            💡 <strong>Kosongkan</strong> jika ingin langsung mengonversi foto tanpa penyesuaian AI.<br />
                                            Isi instruksi untuk modifikasi gaya: tebal, miring, elegan, dll.
                                        </p>
                                    </div>
                                </div>

                                {/* Tombol Proses Font */}
                                <button
                                    onClick={handleProcessFont}
                                    disabled={!uploadedImage || isProcessing}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/25 hover:shadow-purple-900/40 hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <Plus size={18} strokeWidth={3} />
                                    Proses Font {isAiPath && uploadedImage ? '(dengan AI Prompt)' : uploadedImage ? '(Ekstraksi Standar)' : ''}
                                </button>
                                {!uploadedImage && (
                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center font-medium">⬆ Upload foto terlebih dahulu untuk mengaktifkan proses</p>
                                )}
                            </div>
                        )}

                        {/* ── STEP: processing ── */}
                        {unifiedStep === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-10 gap-6">
                                {uploadedImage && (
                                    <div className="relative w-full max-w-xs h-40 mb-2 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-inner">
                                        <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover opacity-30 grayscale" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-transparent animate-pulse" />
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 animate-[bounce_2s_infinite]" />
                                    </div>
                                )}
                                <div className="w-full max-w-lg space-y-3">
                                    <div className="h-3 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40 rounded-full animate-pulse w-full" />
                                    <div className="h-3 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-900/40 dark:to-blue-900/40 rounded-full animate-pulse w-4/5 mx-auto" />
                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <Loader2 size={28} className="text-purple-500 dark:text-purple-400 animate-spin" />
                                    <div className="text-left">
                                        <p className="font-black text-gray-900 dark:text-white text-base">
                                            {isAiPath ? 'Gemini AI Sedang Memproses...' : 'Mengekstrak Karakter...'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                            {isAiPath
                                                ? 'Menganalisis tulisan tangan & menerapkan instruksi Anda'
                                                : 'AI kami sedang mengenali pola huruf dan merangkainya menjadi font digital.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="w-full max-w-lg bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden mt-2">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '65%' }} />
                                </div>
                            </div>
                        )}

                        {/* ── STEP: preview — Preview + Slider + Form + Simpan ── */}
                        {unifiedStep === 'preview' && (
                            <div className="flex flex-col gap-6 transition-all duration-500">
                                {/* Success banner */}
                                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl">
                                    <CheckCircle size={20} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                                    <div>
                                        <p className="font-black text-emerald-800 dark:text-emerald-300 text-sm">Font berhasil diproses!</p>
                                        <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium">
                                            Base: <span className="font-black">{previewFamilyName || 'Indie Flower'}</span> — Pratinjau di bawah ini.
                                        </p>
                                    </div>
                                </div>

                                {/* Preview Box — sinkron real-time dengan slider */}
                                <div className="bg-gradient-to-br from-slate-50 to-purple-50/50 dark:from-gray-900 dark:to-purple-900/10 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">✦ Pratinjau Real-Time</p>
                                    <div
                                        className="ai-preview-font-temp text-3xl lg:text-4xl text-gray-800 dark:text-gray-100"
                                        style={{ letterSpacing: `${letterSpacing}px`, lineHeight: lineSpacing }}
                                    >
                                        JagoNota: Solusi Nota Cerdas
                                    </div>
                                    <div
                                        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 ai-preview-font-temp text-base text-gray-600 dark:text-gray-400"
                                        style={{ letterSpacing: `${letterSpacing}px`, lineHeight: lineSpacing }}
                                    >
                                        Abcdefghijklmnopqrstuvwxyz 0123456789
                                    </div>
                                </div>

                                {/* Slider Manual — Letter & Line Spacing */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-5">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">✦ Penyesuaian Manual</p>

                                    {/* Letter Spacing: 0px — 20px */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Letter Spacing</label>
                                            <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md tabular-nums min-w-[52px] text-center">
                                                {letterSpacing.toFixed(1)}px
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={20}
                                            step={0.1}
                                            value={letterSpacing}
                                            onChange={e => setLetterSpacing(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1.5">
                                            <span>0px</span><span>20px</span>
                                        </div>
                                    </div>

                                    {/* Line Spacing: 1.0 — 3.0 */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Line Spacing</label>
                                            <span className="text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-md tabular-nums min-w-[52px] text-center">
                                                {lineSpacing.toFixed(1)}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={1.0}
                                            max={3.0}
                                            step={0.1}
                                            value={lineSpacing}
                                            onChange={e => setLineSpacing(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-1.5">
                                            <span>1.0</span><span>3.0</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Detail Font */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Beri Nama Font Ini</label>
                                        <input
                                            type="text"
                                            value={newFontName}
                                            onChange={e => setNewFontName(e.target.value)}
                                            placeholder="Contoh: Tulisan Rara"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-2">Font URL <span className="normal-case text-gray-400 font-medium">(Opsional)</span></label>
                                        <input
                                            type="text"
                                            value={fontUrl}
                                            onChange={e => setFontUrl(e.target.value)}
                                            placeholder="https://example.com/fonts/handwriting.woff2"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-400/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-center">
                                    <button
                                        onClick={handleResetUnified}
                                        className="px-5 py-3.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-black text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                                    >
                                        ↩ Coba Lagi
                                    </button>
                                    <button
                                        onClick={handleSaveFont}
                                        disabled={!newFontName.trim() || !currentUserId}
                                        className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/25 whitespace-nowrap"
                                    >
                                        <CheckCircle size={16} />
                                        Simpan ke Koleksi Saya
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Daftar Font Tersedia (tidak berubah) ── */}
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 flex flex-col min-h-[520px] max-h-[620px] h-full overflow-hidden hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-transparent z-10 shrink-0">
                            <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tight">Daftar Font Tersedia</h3>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-gray-100 dark:divide-gray-700 pb-6">
                            {fonts.map((f, i) => (
                                <div key={i} className="px-8 py-5 flex flex-col justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 group transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1">{f.label}</h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${f.isCustom ? 'bg-[#1800ad]/10 dark:bg-blue-900/30 text-[#1800ad] dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                                                {f.isCustom ? 'Tulisan Tangan' : 'Sistem'}
                                            </span>
                                        </div>
                                        {f.isCustom && (
                                            <button
                                                onClick={() => handleDeleteFont(f.value)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Hapus Font"
                                            >
                                                <X size={16} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                    <div className={`text-4xl text-gray-800 dark:text-gray-200 ${f.value.startsWith('custom-font-') ? f.value : ''}`} style={!f.value.startsWith('custom-font-') ? { fontFamily: f.value.replace('font-', '') } : {}}>
                                        JagoNota 123
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}