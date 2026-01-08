import React, { useState } from 'react';
import { User, Lock, ArrowRight, BookOpen, Shield, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginPageProps {
    handleLogin: (token: string, userData: any) => void;
}

const LOGIN_API_URL = 'http://localhost:8081/api/auth/login';

const AuthPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!username || !password) {
            setError('Будь ласка, введіть логін та пароль.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                handleLogin(data.token, data.user); 
                const userRole = data.role || data.user?.roleName;
                if (userRole === 'ADMIN') {
                window.location.href = '/admin'; 
            } else {
                navigate('/account'); 
            }
            } else {
                setError(response.status === 401 ? 'Невірний логін або пароль.' : 'Помилка сервера. Спробуйте пізніше.');
            }
        } catch (err) {
            setError('Не вдалося підключитися до сервера. Перевірте мережу.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
            {/* Декоративні фонові елементи (як у профілі) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                {/* Логотип системи */}
                <div className="mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="relative w-12 h-12">
                        <BookOpen className="absolute inset-0 w-8 h-8 m-auto text-blue-500" strokeWidth={1.5} />
                        <Shield className="absolute inset-0 w-12 h-12 text-blue-400 opacity-20" strokeWidth={1} />
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-white">ISUSA</span>
                </div>

                {/* Основна картка форми */}
                <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Вітаємо знову</h2>
                        <p className="text-sm text-slate-400 mt-2">Введіть дані вашого аккаунту</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2 animate-shake">
                                <XCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Поле Логін */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest">Логін / ID</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="Напр. student_01"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            
                            {/* Поле Пароль */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Пароль</label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        disabled={isLoading}
                                    />
                                </div>
                                <Link to="/forgot-password" className="text-[12px] text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                        Забули пароль?
                                    </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white/50" />
                            ) : (
                                <>
                                    <span>Увійти до порталу</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Нижня частина */}
                <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-2 transition-colors">
                        &larr; Повернутися на головну
                    </Link>
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                        © 2026 Інформаційна Система Управління Студентськими Запитами
                    </p>
                </div>
            </div>
        </div>
    );
};

const XCircle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

export default AuthPage;