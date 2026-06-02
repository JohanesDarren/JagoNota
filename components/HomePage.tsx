import React, { useState } from 'react';
import { Type, PenTool, FolderKanban, Zap, Shield, MousePointer2, ArrowRight, ChevronRight, Moon, Sun, ChevronDown, Instagram, Mail, Star, Download } from 'lucide-react';
import { useTheme } from '../useTheme';

interface Props {
  onNavigate: (view: 'font-manager' | 'template-manager' | 'project-manager') => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export default function HomePage({ onNavigate, isLoggedIn, onLogout }: Props) {
  const { isDark, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = () => {
      setIsSubmitting(true);
      // Menggunakan setTimeout untuk simulasi pengiriman data
      setTimeout(() => {
          alert('Terima kasih atas ulasan Anda!');
          setComment('');
          setRating(0);
          setIsSubmitting(false);
      }, 600);
  };

  const faqs = [
      {
          question: "Berapa biaya menggunakan JagoNota?",
          answer: "Anda hanya perlu membayar Rp 2.000 per unduhan (Pay-per-download) untuk dokumen dalam format PDF atau PNG. Kami menggunakan sistem pembayaran QRIS yang praktis."
      },
      {
          question: "Apakah data saya aman saat membuat dokumen?",
          answer: "Sangat aman. Semua proses pembuatan dan pengeditan dokumen dilakukan 100% di browser Anda (client-side)."
      },
      {
          question: "Bisakah saya menggunakan custom font saya sendiri?",
          answer: "Tentu saja! JagoNota menawarkan fitur AI untuk mengubah tulisan tangan Anda menjadi font digital atau mengunggah font favorit Anda sendiri."
      },
      {
          question: "Bagaimana proses pembuatan notanya?",
          answer: "Anda perlu mendesain tata letak nota/kwitansi Anda terlebih dahulu, atau mengunggah elemen yang diperlukan, lalu menggunakan editor kami yang mudah (drag & drop)."
      }
  ];

  if (isLoggedIn) {
      return (
          <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 flex flex-col transition-colors duration-300">
              <nav className="fixed top-0 left-0 right-0 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                  <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <img src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} alt="JagoNota Logo" className="h-14 object-contain" />
                      </div>
                      
                      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
                          <button onClick={() => onNavigate('template-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">TEMPLATE</button>
                          <button onClick={() => onNavigate('project-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">PROJECTS</button>
                          <button onClick={() => onNavigate('font-manager')} className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FONTS</button>
                      </div>

                      <div className="flex items-center gap-4">
                          <button 
                              onClick={toggleTheme}
                              className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                              {isDark ? <Sun size={20} /> : <Moon size={20} />}
                          </button>
                          <button 
                              onClick={onLogout}
                              className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-6 py-2.5 rounded-full font-bold transition-all shadow-sm"
                          >
                              Logout
                          </button>
                      </div>
                  </div>
              </nav>

              <main className="flex-1 max-w-7xl mx-auto px-6 pt-32 pb-16 w-full flex flex-col items-center">
                  <div className="text-center mb-16">
                      <h1 className="text-4xl md:text-5xl font-black mb-4">Dashboard Anda</h1>
                      <p className="text-gray-500 dark:text-gray-400">Pilih alat yang ingin Anda gunakan hari ini.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                      <div 
                          onClick={() => onNavigate('template-manager')}
                          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center"
                      >
                          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <PenTool size={36} />
                          </div>
                          <h3 className="text-xl font-bold mb-3">Buat Template</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Desain layout nota atau kwitansi Anda sendiri.</p>
                      </div>

                      <div 
                          onClick={() => onNavigate('project-manager')}
                          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center"
                      >
                          <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <FolderKanban size={36} />
                          </div>
                          <h3 className="text-xl font-bold mb-3">Kelola Project</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Terapkan template menjadi dokumen siap cetak.</p>
                      </div>

                      <div 
                          onClick={() => onNavigate('font-manager')}
                          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center"
                      >
                          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                              <Type size={36} />
                          </div>
                          <h3 className="text-xl font-bold mb-3">Custom Font</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">Generate font dari tulisan tangan Anda via AI.</p>
                      </div>
                  </div>
              </main>

              <footer className="py-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 text-center flex flex-col items-center justify-center">
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500">
                      Aplikasi JagoNota adalah buatan JagoAI.
                  </p>
              </footer>
          </div>
      );
  }

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
                    <img src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} alt="JagoNota Logo" className="h-14 object-contain" />
                </div>
                
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <a href="#features" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FITUR</a>
                    <a href="#faq" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">FAQ</a>
                    <a href="#contact" className="hover:text-[#1800ad] dark:hover:text-blue-400 transition-colors">KONTAK</a>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        title="Toggle dark mode"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button 
                        onClick={() => onNavigate('project-manager')}
                        className="bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50"
                    >
                        Login
                    </button>
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
                    Solusi pembuatan nota dan kwitansi tercepat dan teraman yang berjalan sepenuhnya di browser Anda.
                </p>
                
                <div className="flex items-center gap-6 pt-4">
                    <button 
                        onClick={() => onNavigate('project-manager')}
                        className="bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl shadow-[#1800ad]/20 dark:shadow-blue-900/50"
                    >
                        Ayo mulai! <ArrowRight size={20} />
                    </button>
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
                            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center"><Download size={24} /></div>
                            <span className="font-bold text-xs text-gray-500 dark:text-gray-400 tracking-wider">DOWNLOAD</span>
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
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><PenTool size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Desain Mandiri</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">BUTUH UPLOAD & DESAIN</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Shield size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Aman</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">100% CLIENT-SIDE</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Fleksibel</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">PAY PER DOWNLOAD</div>
                    </div>
                </div>
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><MousePointer2 size={20} /></div>
                    <div>
                        <div className="font-bold text-gray-900 dark:text-white">Mudah</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">DRAG & DROP</div>
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
                <div className="bg-gray-50/80 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-400/80 rounded-2xl flex items-center justify-center mb-8">
                        <PenTool size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Desain Template</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                        Bebas berkreasi membuat layout nota dan kwitansi yang sesuai dengan branding bisnis Anda melalui kanvas drag & drop.
                    </p>
                    <div className="w-12 h-1 bg-emerald-200 dark:bg-emerald-800/50 rounded-full mt-auto"></div>
                </div>

                <div className="bg-gray-50/80 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-500 dark:text-purple-400/80 rounded-2xl flex items-center justify-center mb-8">
                        <FolderKanban size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Manajemen Dokumen</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                        Kelola semua file project nota secara terorganisir. Simpan, edit kembali, dan bayar hanya saat Anda mengunduhnya.
                    </p>
                    <div className="w-12 h-1 bg-purple-200 dark:bg-purple-800/50 rounded-full mt-auto"></div>
                </div>

                <div className="bg-gray-50/80 dark:bg-gray-800/50 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col h-full backdrop-blur-sm transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400/80 rounded-2xl flex items-center justify-center mb-8">
                        <Type size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-200">Koleksi Font Personal</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 flex-1">
                        Gunakan AI untuk mengubah tulisan tangan Anda menjadi font digital, jadikan setiap dokumen terasa lebih otentik.
                    </p>
                    <div className="w-12 h-1 bg-blue-200 dark:bg-blue-800/50 rounded-full mt-auto"></div>
                </div>
            </div>
        </div>

        {/* FAQ & Rating Section */}
        <div id="faq" className="py-24 px-6 max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Left: FAQ */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Pertanyaan yang Sering Diajukan</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Semua yang perlu Anda ketahui tentang JagoNota.</p>
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

                {/* Right: App Rating */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center">
                    <h3 className="text-2xl font-black mb-2">Beri Kami Rating!</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Bagaimana pengalaman Anda menggunakan JagoNota?</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setRatingHover(star)}
                                onMouseLeave={() => setRatingHover(null)}
                                onClick={() => setRating(star)}
                            >
                                <Star 
                                    size={40} 
                                    className={`${(ratingHover || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'} transition-colors`} 
                                />
                            </button>
                        ))}
                    </div>

                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tulis ulasan Anda di sini (opsional)..."
                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1800ad] dark:focus:ring-blue-500 transition-all h-32 mb-4"
                    />

                    <button 
                        onClick={handleSubmitReview}
                        disabled={isSubmitting}
                        className={`w-full font-bold py-3.5 rounded-xl transition-colors shadow-lg relative z-10 pointer-events-auto ${isSubmitting ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed' : 'bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 text-white'}`}
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                </div>
            </div>
        </div>

        {/* Footer Section */}
        <footer id="contact" className="bg-[#1800ad] dark:bg-gray-950 text-white pt-20 pb-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                    <div className="flex flex-col items-start">
                        <img src="/JagoNota BW.png" alt="JagoNota Logo" className="h-14 object-contain mb-6 opacity-90" />
                        <p className="text-blue-200 dark:text-gray-400 text-sm leading-relaxed mb-6 font-medium max-w-xs">
                            Solusi pembuatan nota dan kwitansi yang profesional, cepat, dan terpercaya. Bagian dari ekosistem JagoAI.
                        </p>
                    </div>
                    
                    <div className="flex flex-col">
                        <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-sm">Layanan</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-200 dark:text-gray-400 hover:text-white transition-colors text-sm">Template Nota</a></li>
                            <li><a href="#" className="text-blue-200 dark:text-gray-400 hover:text-white transition-colors text-sm">Manajemen Dokumen</a></li>
                            <li><a href="#" className="text-blue-200 dark:text-gray-400 hover:text-white transition-colors text-sm">Custom Font AI</a></li>
                        </ul>
                    </div>

                    <div className="flex flex-col">
                        <h4 className="font-bold mb-6 text-white uppercase tracking-widest text-sm">Hubungi Kami</h4>
                        <div className="space-y-4">
                            <a href="mailto:jagoai.bussiness@gmail.com" className="flex items-center gap-3 text-blue-200 dark:text-gray-400 hover:text-white text-sm transition-colors">
                                <Mail size={18} />
                                jagoai.bussiness@gmail.com
                            </a>
                            <a href="https://instagram.com/jagoai_" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-200 dark:text-gray-400 hover:text-white text-sm transition-colors">
                                <Instagram size={18} />
                                @jagoai_
                            </a>
                        </div>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-blue-800/50 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-blue-300 dark:text-gray-500 text-sm font-medium">
                        © 2026 JagoNota. All rights reserved.
                    </p>
                    <div className="text-blue-300 dark:text-gray-500 text-sm font-medium">
                        Designed with ❤️ by JagoAI
                    </div>
                </div>
            </div>
        </footer>
    </div>
  );
}
