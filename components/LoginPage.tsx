import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, RefreshCcw, User } from 'lucide-react';
import { useTheme } from '../useTheme';
import { supabase } from '../utils';

interface LoginPageProps {
    onLogin: () => void;
    onBack: () => void;
}

export default function LoginPage({ onLogin, onBack }: LoginPageProps) {
    const { isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    type Mode = 'login' | 'register' | 'forgot_password';
    const [mode, setMode] = useState<Mode>('login');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            if (mode === 'forgot_password') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: window.location.origin,
                });
                if (resetError) throw resetError;
                
                setSuccessMsg("Jika email Anda terdaftar, Anda akan menerima tautan pemulihan password sesaat lagi.");
            } else if (mode === 'register') {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: email.trim(),
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });

                if (signUpError) throw signUpError;
                
                if (data.user) {
                    onLogin();
                }
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

                if (signInError) throw signInError;

                if (data.user) {
                    onLogin();
                }
            }
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan saat memproses permintaan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 font-sans text-gray-900 dark:text-gray-100 flex transition-colors duration-300 relative z-0">
            {/* Decorative Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <button 
                    onClick={() => {
                        if (mode !== 'login') {
                            setMode('login');
                            setError(null);
                            setSuccessMsg(null);
                        } else {
                            onBack();
                        }
                    }} 
                    className="absolute top-8 left-8 text-sm font-bold text-gray-400 hover:text-[#1800ad] dark:hover:text-blue-400 flex items-center gap-2 uppercase tracking-widest transition-colors"
                >
                    ← Kembali
                </button>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <img 
                            src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} 
                            alt="JagoNota Logo" 
                            className="h-12 w-auto object-contain" 
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        {mode === 'forgot_password' ? 'Pulihkan Password' : (mode === 'register' ? 'Buat akun Anda' : 'Masuk ke akun Anda')}
                    </h2>
                    
                    {mode === 'forgot_password' && (
                        <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                            Masukkan email Anda dan kami akan mengirimkan tautan untuk mengatur ulang password Anda.
                        </p>
                    )}

                    {mode !== 'forgot_password' && (
                        <p className="mt-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            {mode === 'register' ? 'Sudah punya akun? ' : 'Belum punya akun? '}
                            <button 
                                onClick={() => {
                                    setMode(mode === 'register' ? 'login' : 'register');
                                    setError(null);
                                }} 
                                className="font-bold text-[#1800ad] hover:text-[#120085] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                {mode === 'register' ? 'Masuk sekarang' : 'Daftar sekarang'}
                            </button>
                        </p>
                    )}
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm py-8 px-4 shadow-xl border border-white/60 dark:border-gray-700 sm:rounded-[2rem] sm:px-10 transition-colors duration-300">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}
                            {successMsg && (
                                <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-xl text-sm font-medium text-center">
                                    {successMsg}
                                </div>
                            )}

                            {mode === 'register' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input 
                                            type="text" 
                                            required 
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1800ad] dark:focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1800ad] dark:focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="email@contoh.com"
                                    />
                                </div>
                            </div>

                            {mode !== 'forgot_password' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Password</label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <input 
                                                type="password" 
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1800ad] dark:focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input 
                                                id="remember-me" 
                                                name="remember-me" 
                                                type="checkbox" 
                                                className="h-4 w-4 text-[#1800ad] dark:text-blue-500 focus:ring-[#1800ad] dark:focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                            />
                                            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                                                Ingat saya
                                            </label>
                                        </div>

                                        {mode === 'login' && (
                                            <div className="text-sm">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setMode('forgot_password');
                                                        setError(null);
                                                        setSuccessMsg(null);
                                                    }}
                                                    className="font-bold text-[#1800ad] hover:text-[#120085] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    Lupa password?
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50 text-sm font-bold text-white bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1800ad] dark:focus:ring-offset-gray-900 dark:focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Memproses...' : (
                                        mode === 'forgot_password' ? 'Kirim Tautan' : 
                                        mode === 'register' ? 'Daftar' : 'Masuk'
                                    )} 
                                    {mode === 'forgot_password' ? <RefreshCcw size={16} /> : <ArrowRight size={16} />}
                                </button>
                            </div>
                            
                            {mode === 'forgot_password' && (
                                <div className="mt-4 text-center">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setMode('login');
                                            setError(null);
                                            setSuccessMsg(null);
                                        }}
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
