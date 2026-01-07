import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:8081/api/auth/forgot-password?email=${encodeURIComponent(email)}`, {
                method: 'POST'
            });
            if (response.ok) {
                setIsSent(true);
            } else {
                setError('Користувача з такою поштою не знайдено.');
            }
        } catch (err) {
            setError('Помилка з\'єднання з сервером.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
                {!isSent ? (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Відновлення доступу</h2>
                            <p className="text-sm text-slate-400 mt-2">Ми надішлемо інструкції на вашу пошту</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="text-red-400 text-xs text-center">{error}</div>}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="Введіть ваш Email"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "Надіслати лист"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-4 space-y-4">
                        <CheckCircle size={48} className="text-emerald-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Перевірте пошту</h2>
                        <p className="text-slate-400 text-sm">Ми відправили посилання для зміни пароля на <b>{email}</b></p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/auth" className="text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-2 transition-colors">
                        <ArrowLeft size={16} /> Повернутися до входу
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;