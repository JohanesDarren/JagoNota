import React, { useState } from 'react';
import { Type, PenTool, FolderKanban, Zap, Shield, Clock, MousePointer2, ArrowRight, ChevronRight, Moon, Sun, Check, ChevronDown, ChevronUp, Star, Crown, Instagram, Mail } from 'lucide-react';
import { useTheme } from '../useTheme';

interface Props {
  onNavigate: (view: 'font-manager' | 'template-manager' | 'project-manager') => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function HomePage({ onNavigate, isLoggedIn, onLogout }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
      {
          question: "Apakah JagoNota benar-benar gratis?",
          answer: "Ya! JagoNota menyediakan paket Free yang bisa Anda gunakan selamanya tanpa biaya sepeser pun dengan fitur dasar. Jika Anda membutuhkan fitur lebih, Anda bisa beralih ke paket GO atau Ultra."
      },
      {
          question: "Apakah data saya aman saat membuat dokumen?",
          answer: "Sangat aman. Semua proses pembuatan dan pengeditan dokumen dilakukan 100% di browser Anda (client-side). Kami tidak pernah mengunggah atau menyimpan informasi sensitif Anda di server kami."
      },
      {
          question: "Bisakah saya menggunakan custom font saya sendiri?",
          answer: "Tentu saja! JagoNota menawarkan fitur Custom Font di mana Anda dapat mengunggah font tulisan tangan atau font favorit Anda untuk membuat dokumen Anda lebih personal."
      },
      {
          question: "Apakah mudah digunakan untuk pemula?",
          answer: "JagoNota dirancang dengan antarmuka yang sangat intuitif. Anda hanya perlu drag & drop elemen, mengisi teks, dan mengekspor dokumen Anda dalam hitungan detik. Tidak butuh keahlian desain."
      }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden transition-colors duration-300 relative z-0">
        {/* Decorative Background Blur */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 dark:bg-blue-600/10 blur-[100px]"></div>
            <div className="absolute top-[20%] -right-[5%] w-[30%] h-[40%] rounded-full bg-purple-400/30 dark:bg-purple-600/10 blur-[100px]"></div>
            <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[40%] rounded-full bg-indigo-400/30 dark:bg-indigo-600/10 blur-[100px]"></div>
        </div>

        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl z-50 border-b border-white/20 dark:border-gray-800 transition-colors duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} alt="JagoNota Logo" className="h-10 object-contain" />
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => onNavigate('template-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">TEMPLATE</button>
                            <button onClick={() => onNavigate('project-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">PROJECTS</button>
                            <button onClick={() => onNavigate('font-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FONTS</button>
                        </>
                    ) : (
                        <>
                            <a href="#features" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FITUR</a>
                            <a href="#pricing" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">LANGGANAN</a>
                            <a href="#faq" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FAQ</a>
                            <a href="#contact" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">KONTAK KAMI</a>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Toggle dark mode"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {isLoggedIn ? (
                        <button 
                            onClick={onLogout}
                            className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm"
                        >
                            Logout
                        </button>
                    ) : (
                        <button 
                            onClick={() => onNavigate('project-manager')}
                            className="bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50"
                        >
                            Mulai Gratis
                        </button>
                    )}
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    100% CLIENT-SIDE PROCESSING
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.95]">
                    Master Your <br/>
                    <span className="text-[#1800ad] dark:text-blue-400">Documents</span><br/>
                    <span className="text-gray-400 dark:text-gray-600">Without<br/>Limits.</span>
                </h1>
                
                <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">
                    Solusi pembuatan nota dan kwitansi tercepat dan teraman yang berjalan sepenuhnya di browser Anda. Tidak ada upload, tidak ada resiko.
                </p>
                
                <div className="flex items-center gap-6 pt-4">
                    <button 
                        onClick={() => onNavigate('project-manager')}
                        className="bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl shadow-[#1800ad]/20 dark:shadow-blue-900/50"
                    >
                        {isLoggedIn ? 'Dashboard' : 'Mulai Sekarang'} <ArrowRight size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <div className="flex text-yellow-500 text-[10px]">★★★★★</div>
                            <div className="font-bold text-gray-600 dark:text-gray-400 text-xs">DIPERCAYA 10K+ USER</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1800ad]/10 dark:from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div className="ml-auto text-xs font-bold text-gray-300 dark:text-gray-500 tracking-widest">JagoNota Workspace</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><PenTool size={24} /></div>
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 tracking-wider">TEMPLATE</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center"><FolderKanban size={24} /></div>
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 tracking-wider">PROJECT</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Type size={24} /></div>
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 tracking-wider">CUSTOM FONT</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center"><Zap size={24} /></div>
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 tracking-wider">EXPORT</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-red-50 dark:bg-gray-700 p-6 rounded-2xl">
                        <div className="w-1/3 h-2 bg-red-200 dark:bg-gray-600 rounded-full mb-3"></div>
                        <div className="space-y-2">
                            <div className="w-full h-2 bg-red-100 dark:bg-gray-600 rounded-full"></div>
                            <div className="w-5/6 h-2 bg-red-100 dark:bg-gray-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Badges */}
        <div className="border-y border-white/40 dark:border-gray-800 bg-white/40 dark:bg-gray-800/50 backdrop-blur-md py-12 transition-colors duration-300 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/4 w-[30%] h-[80%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/5 blur-[100px] -translate-y-1/2"></div>
            </div>
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400"><Zap size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Instan</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">TANPA UPLOAD</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400"><Shield size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Aman</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">100% CLIENT-SIDE</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400"><Clock size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Cepat</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">PROSES DETIK</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400"><MousePointer2 size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Mudah</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">DRAG & DROP</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="text-red-500 dark:text-red-400 font-bold text-sm tracking-widest uppercase mb-4">Katalog Layanan</div>
                    <h2 className="text-5xl font-black tracking-tight">Semua yang Anda<br/>Butuhkan.</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">
                    Pilih dari alat pengolah dokumen profesional yang dirancang untuk memudahkan pekerjaan Anda setiap hari.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoggedIn ? (
                    <>
                        {/* Feature Card 1 */}
                        <div 
                            onClick={() => onNavigate('template-manager')}
                            className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <PenTool size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Buat Template</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-12 flex-1">
                                Desain format nota atau kwitansi Anda sendiri dengan kanvas dinamis yang fleksibel dan mudah digunakan.
                            </p>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-auto group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors">
                                GUNAKAN SEKARANG
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#1800ad]/10 dark:group-hover:bg-blue-400/10">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div 
                            onClick={() => onNavigate('project-manager')}
                            className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <FolderKanban size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Kelola Project</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-12 flex-1">
                                Implementasikan template Anda menjadi dokumen nyata, tambahkan teks dan tanda tangan dengan mudah.
                            </p>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-auto group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors">
                                GUNAKAN SEKARANG
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#1800ad]/10 dark:group-hover:bg-blue-400/10">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div 
                            onClick={() => onNavigate('font-manager')}
                            className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-[2rem] shadow-lg shadow-blue-900/5 border border-white dark:border-gray-700 hover:shadow-xl hover:bg-white dark:hover:bg-gray-800 dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <Type size={32} />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Custom Font</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-12 flex-1">
                                Unggah dan kelola font tulisan tangan atau pilihan Anda sendiri untuk memberikan sentuhan personal.
                            </p>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mt-auto group-hover:text-[#1800ad] dark:group-hover:text-blue-400 transition-colors">
                                GUNAKAN SEKARANG
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center group-hover:bg-[#1800ad]/10 dark:group-hover:bg-blue-400/10">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Static Feature Card 1 */}
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400/80 rounded-2xl flex items-center justify-center mb-8">
                                <PenTool size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Desain Template</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                                Bebas berkreasi membuat layout nota dan kwitansi yang sesuai dengan branding bisnis Anda melalui kanvas drag & drop.
                            </p>
                            <div className="w-12 h-1 bg-emerald-200 dark:bg-emerald-800/50 rounded-full mt-auto"></div>
                        </div>

                        {/* Static Feature Card 2 */}
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400/80 rounded-2xl flex items-center justify-center mb-8">
                                <FolderKanban size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Manajemen Dokumen</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                                Kelola semua file project nota secara terorganisir. Simpan, edit kembali, dan jadikan dokumen siap cetak kapan saja.
                            </p>
                            <div className="w-12 h-1 bg-purple-200 dark:bg-purple-800/50 rounded-full mt-auto"></div>
                        </div>

                        {/* Static Feature Card 3 */}
                        <div className="bg-gray-50/50 dark:bg-gray-800/30 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400/80 rounded-2xl flex items-center justify-center mb-8">
                                <Type size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Koleksi Font Personal</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                                Gunakan AI untuk mengubah tulisan tangan Anda menjadi font digital, jadikan setiap dokumen terasa lebih otentik.
                            </p>
                            <div className="w-12 h-1 bg-blue-200 dark:bg-blue-800/50 rounded-full mt-auto"></div>
                        </div>
                    </>
                )}
            </div>
        </div>

        {!isLoggedIn && (
            <>
                {/* Pricing Section */}
                <div id="pricing" className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="text-center mb-16">
                        <div className="text-[#1800ad] dark:text-blue-400 font-bold text-sm tracking-widest uppercase mb-4">Pricing Plans</div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Pilih Paket Sesuai Kebutuhanmu.</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                            Tingkatkan produktivitas Anda dengan berbagai pilihan paket yang kami tawarkan. Upgrade kapan saja.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
                        {/* JagoNota Free */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col transition-all hover:shadow-xl dark:hover:shadow-gray-900/50">
                            <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4">JagoNota Free</h3>
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Rp 0</span>
                                <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                                    <span>gratis selamanya,</span>
                                    <span>kebutuhan dasar.</span>
                                </div>
                            </div>
                            
                            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-6"></div>
                            
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">3 Template Dokumen</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Ekspor PDF (watermark)</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Penyimpanan Lokal</span>
                                </li>
                            </ul>
                            
                            <button 
                                onClick={() => onNavigate('project-manager')}
                                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm border border-gray-200 dark:border-gray-700 mt-auto"
                            >
                                Mulai Gratis
                            </button>
                        </div>

                        {/* JagoNota GO */}
                        <div className="relative mt-8 md:mt-0">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full bg-gradient-to-r from-blue-500 to-[#1800ad] dark:from-blue-400 dark:to-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-blue-900/20 whitespace-nowrap z-20">
                                <Star size={14} fill="currentColor" /> POPULER
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-md border border-gray-100 dark:border-gray-800 flex flex-col h-full transition-all hover:shadow-xl dark:hover:shadow-blue-900/10 overflow-hidden relative z-10">
                                {/* Background color blobs representing 'GO' style */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 dark:bg-blue-600/30 blur-[60px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
                                <div className="absolute top-[30%] left-0 w-[120%] h-40 bg-orange-400/20 dark:bg-orange-600/30 blur-[50px] pointer-events-none -translate-x-1/4"></div>
                                
                                <div className="z-10 relative flex flex-col h-full">
                                <h3 className="font-bold text-2xl text-gray-900 dark:text-white mb-4">JagoNota GO</h3>
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Rp 49.000</span>
                                <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 font-medium leading-tight">
                                    <span>/bulan untuk</span>
                                    <span>profesional lepas.</span>
                                </div>
                            </div>
                            
                            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full mb-6"></div>
                            
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Template Tanpa Batas</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Ekspor PDF kualitas tinggi</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Upload Custom Font</span>
                                </li>
                                <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <div className="text-gray-900 dark:text-gray-100"><Check size={18} strokeWidth={2.5} /></div>
                                    <span className="font-medium text-sm">Tanpa Watermark</span>
                                </li>
                            </ul>

                            <button 
                                onClick={() => onNavigate('project-manager')}
                                className="w-full bg-gray-100/80 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm border border-gray-200 dark:border-gray-700 mt-auto z-10"
                            >
                                Pilih Paket GO
                            </button>
                        </div>
                        </div>
                        </div>

                        {/* JagoNota Ultra */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-2xl flex flex-col h-full transform md:-translate-y-2 border border-gray-100 dark:border-gray-800 overflow-hidden relative z-10 transition-all hover:-translate-y-4 hover:shadow-blue-900/20 mt-8 md:mt-0">
                            {/* Background color blobs representing 'Plus' style */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 dark:bg-blue-600/30 blur-[60px] rounded-full pointer-events-none -translate-y-1/4 translate-x-1/4"></div>
                                <div className="absolute top-[30%] left-0 w-[120%] h-40 bg-orange-400/20 dark:bg-orange-600/30 blur-[50px] pointer-events-none -translate-x-1/4"></div>
                                
                                <div className="z-10 relative flex flex-col h-full">
                                    <h3 className="font-bold text-2xl mb-4 flex items-center gap-2"><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500 dark:from-blue-400 dark:to-orange-400">JagoNota Ultra</span> <Crown size={20} className="text-yellow-500" /></h3>
                                    <div className="flex items-center gap-3 mb-8">
                                        <span className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Rp 99.000</span>
                                        <div className="flex flex-col text-xs text-gray-600 dark:text-gray-400 font-medium leading-tight">
                                            <span>/bulan untuk</span>
                                            <span>kebutuhan enterprise.</span>
                                        </div>
                                    </div>
                                    
                                    <div className="h-px bg-white/60 dark:bg-gray-800/60 w-full mb-6"></div>
                                    
                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                            <div className="text-gray-900 dark:text-white"><Check size={18} strokeWidth={2.5} /></div>
                                            <span className="font-medium text-sm">Semua fitur Paket GO</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                            <div className="text-gray-900 dark:text-white"><Check size={18} strokeWidth={2.5} /></div>
                                            <span className="font-medium text-sm">Prioritas Dukungan 24/7</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                            <div className="text-gray-900 dark:text-white"><Check size={18} strokeWidth={2.5} /></div>
                                            <span className="font-medium text-sm">Sinkronisasi Cloud Backup</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                                            <div className="text-gray-900 dark:text-white"><Check size={18} strokeWidth={2.5} /></div>
                                            <span className="font-medium text-sm">Akses API (Segera Hadir)</span>
                                        </li>
                                    </ul>
                                    
                                    <button 
                                        onClick={() => onNavigate('project-manager')}
                                        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-3.5 rounded-2xl transition-colors shadow-xl mt-auto z-10"
                                    >
                                        Pilih Paket Ultra
                                    </button>
                                </div>
                            </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="py-24 px-6 max-w-3xl mx-auto border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Pertanyaan yang Sering Diajukan</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Semua yang perlu Anda ketahui tentang JagoNota.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`border border-white/60 dark:border-gray-700 rounded-2xl overflow-hidden transition-colors ${openFaq === index ? 'bg-white/80 dark:bg-gray-800 backdrop-blur-md shadow-md shadow-blue-900/5' : 'bg-white/40 dark:bg-gray-800/30 backdrop-blur-sm hover:bg-white/60 dark:hover:bg-gray-800'}`}
                            >
                                <button 
                                    className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-gray-900 dark:text-gray-100 focus:outline-none"
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                >
                                    <span>{faq.question}</span>
                                    <span className={`text-[#1800ad] dark:text-blue-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>
                                        <ChevronDown size={20} />
                                    </span>
                                </button>
                                <div 
                                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <footer id="contact" className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-8 transition-colors duration-300">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12 mb-12 text-center md:text-left">
                            <div className="flex flex-col items-center md:items-start max-w-sm">
                                <img src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} alt="JagoNota Logo" className="h-12 object-contain mb-6" />
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                                    Solusi pembuatan nota dan kwitansi tercepat, teraman, dan berjalan sepenuhnya di browser Anda. Tidak ada upload, tidak ada resiko.
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-center md:items-start">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-widest text-xs">Hubungi Kami</h4>
                                <div className="space-y-3">
                                    <a href="mailto:jagoai.bussiness@gmail.com" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 text-sm transition-colors">
                                        <Mail size={18} />
                                        jagoai.bussiness@gmail.com
                                    </a>
                                    <a href="https://instagram.com/jagoai_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-500 dark:text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 text-sm transition-colors">
                                        <Instagram size={18} />
                                        @jagoai_
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center flex flex-col items-center justify-center gap-4">
                            <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                                © 2026 JagoNota. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </>
        )}
    </div>
  );
}
