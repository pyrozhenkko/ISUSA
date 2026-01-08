import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    console.log("Отриманий токен з URL:", token);
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
        alert("Паролі не збігаються!");
        return;
    }

    setIsLoading(true);
    try {
        const url = new URL('http://localhost:8081/api/auth/reset-password');
        url.searchParams.append('token', token || '');
        url.searchParams.append('newPassword', newPassword);

        const response = await fetch(url.toString(), {
            method: 'POST',
        });

        if (response.ok) setStatus('success');
        else setStatus('error');
    } catch (err) {
        setStatus('error');
    } finally {
        setIsLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                {status === 'success' ? (
                    <div className="text-center space-y-4">
                        <CheckCircle size={48} className="text-emerald-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Пароль змінено!</h2>
                        <p className="text-slate-400">Тепер ви можете увійти з новим паролем.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full bg-blue-600 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all"
                        >
                            До сторінки входу
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white">Новий пароль</h2>
                            <p className="text-sm text-slate-400 mt-2">Придумайте надійний пароль для захисту</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Новий пароль"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    placeholder="Підтвердіть пароль"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold transition-all flex items-center justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Оновити пароль"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;