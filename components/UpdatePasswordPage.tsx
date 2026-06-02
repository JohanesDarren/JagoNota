import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../useTheme';
import { supabase } from '../utils';

interface UpdatePasswordPageProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function UpdatePasswordPage({ onSuccess, onCancel }: UpdatePasswordPageProps) {
    const { isDark } = useTheme();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => {
        // Parse access_token and refresh_token from the URL hash FIRST,
        // then call setSession() to establish the recovery session,
        // and only after that clear the hash from the URL bar.
        const hash = window.location.hash;

        const parseAndSetSession = async () => {
            if (hash && hash.includes('access_token')) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    // Now it's safe to clear the hash
                    window.history.replaceState(null, '', window.location.pathname);

                    if (sessionError) {
                        setError('Tautan tidak valid atau sudah kedaluwarsa. Silakan minta reset password baru.');
                    } else {
                        setSessionReady(true);
                    }
                } else {
                    window.history.replaceState(null, '', window.location.pathname);
                    setError('Tautan reset tidak valid. Silakan minta reset password baru.');
                }
            } else {
                // No hash — check if a recovery session already exists (e.g. re-render)
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setSessionReady(true);
                } else {
                    setError('Tautan tidak valid atau sudah kedaluwarsa. Silakan minta reset password baru.');
                }
            }
        };

        parseAndSetSession();
    }, []);

    // Redirect to login 3 seconds after success — using useEffect for proper cleanup
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => onSuccess(), 3000);
        return () => clearTimeout(timer); // ✅ Prevents firing on unmounted component
    }, [success, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Password tidak cocok.");
            return;
        }

        if (password.length < 6) {
            setError("Password minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;
            
            // Sign out to clear the recovery session and force a clean login
            await supabase.auth.signOut();

            setSuccess(true);
            // Redirect is handled by the useEffect below to allow cleanup on unmount
        } catch (err: any) {
            setError(err.message || 'Gagal memperbarui password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 font-sans text-gray-900 dark:text-gray-100 flex transition-colors duration-300 relative z-0">
                <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm p-10 text-center shadow-xl border border-white/60 dark:border-gray-700 sm:rounded-[2rem] transition-colors duration-300">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Password Diperbarui</h2>
                        <p className="text-gray-500 dark:text-gray-400">Password Anda berhasil diubah. Mengarahkan ke beranda...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 font-sans text-gray-900 dark:text-gray-100 flex transition-colors duration-300 relative z-0">
            {/* Decorative Background Blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-400/30 dark:bg-blue-600/5 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-purple-400/30 dark:bg-purple-600/5 blur-[120px]"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center">
                        <img 
                            src={isDark ? "/JagoNota BW.png" : "/JagoNota.png"} 
                            alt="JagoNota Logo" 
                            className="h-12 w-auto object-contain" 
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Buat Password Baru
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                        Silakan masukkan password baru Anda di bawah ini.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white/60 dark:bg-gray-800/80 backdrop-blur-sm py-8 px-4 shadow-xl border border-white/60 dark:border-gray-700 sm:rounded-[2rem] sm:px-10 transition-colors duration-300">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {!sessionReady && !error && (
                                <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                                    Memverifikasi tautan reset...
                                </div>
                            )}
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-xl text-sm font-medium text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Password Baru</label>
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

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Konfirmasi Password Baru</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input 
                                        type="password" 
                                        required 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1800ad] dark:focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading || !sessionReady}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#1800ad]/20 dark:shadow-blue-900/50 text-sm font-bold text-white bg-[#1800ad] hover:bg-[#120085] dark:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1800ad] dark:focus:ring-offset-gray-900 dark:focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Menyimpan...' : !sessionReady ? 'Memverifikasi...' : 'Perbarui Password'} <ArrowRight size={16} />
                                </button>
                            </div>
                            
                            <div className="mt-4 text-center">
                                <button 
                                    type="button"
                                    onClick={onCancel}
                                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
