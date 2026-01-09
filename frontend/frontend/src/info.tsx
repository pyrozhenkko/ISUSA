import React from 'react';
import { 
    BookOpen, Shield, Bell, LogOut, User, ArrowRight, 
    BookMarked, FileEdit, Lock, TrendingUp, UserCircle, LogIn,
    MessageSquare, CheckCircle, Archive, CornerRightUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import "./index.css";
import Footer from './Footer';

interface InfoPageProps {
    isAuthenticated: boolean;
    handleLogout?: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ isAuthenticated, handleLogout }) => {
    const navigate = useNavigate();

    const handleAuthAction = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/account');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Brand */}
                        <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                <BookOpen className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 m-auto text-blue-500" strokeWidth={1.5} />
                                <Shield className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 opacity-30" strokeWidth={1} />
                            </div>
                            <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ISUSA</span>
                        </Link>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {isAuthenticated ? (
                                <>
                                    <button 
                                        onClick={() => navigate('/account')}
                                        className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors"
                                        title="Профіль"
                                    >
                                        <User className="w-4 h-4 text-slate-300" />
                                    </button>
                                    <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                                        <Bell className="w-5 h-5 text-slate-300" />
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        className="hidden xs:flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm text-slate-300">Вихід</span>
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium text-xs sm:text-sm"
                                >
                                    <LogIn className="w-3.5 h-3.5 sm:w-4 h-4" />
                                    Увійти
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-28">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white tracking-tight leading-tight">
                            Управління
                            <br className="hidden sm:block" />
                            <span className="text-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400">
                                {" "}Студентськими Заявами
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
                            Подавайте, відстежуйте та підписуйте університетські документи цифровим підписом на єдиній захищеній платформі.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-20 px-4">
                            <button 
                                onClick={handleAuthAction}
                                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 font-bold border border-emerald-700 shadow-lg shadow-emerald-900/20"
                            >
                                <span>Почати роботу</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <Link 
                                to="/docs" 
                                className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl flex items-center justify-center gap-2 transition-colors font-semibold"
                            >
                                <BookMarked className="w-5 h-5" />
                                <span>Документація</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Draft System Card */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all group">
                            <div className="flex flex-col xs:flex-row items-start gap-4 sm:gap-5">
                                <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl group-hover:bg-blue-600/20 shrink-0">
                                    <FileEdit className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Система Чернеток</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mb-5 leading-relaxed">
                                        Зберігайте свій прогрес та повертайтеся до редагування заяв у будь-який час. Жодних втрачених даних завдяки системі чернеток.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                                        <span className="px-2.5 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 font-medium">БЕЗ ПАПЕРІВ</span>
                                        <span className="px-2.5 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-400 font-medium uppercase">Редагування 24/7</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Digital Signature Card */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-emerald-500/50 transition-all group">
                            <div className="flex flex-col xs:flex-row items-start gap-4 sm:gap-5">
                                <div className="p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl group-hover:bg-emerald-600/20 shrink-0">
                                    <Lock className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Цифровий Підпис</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mb-5 leading-relaxed">
                                        Безпечно підписуйте та надсилайте документи з шифруванням RSA. Ваші підписи мають юридичну силу та надійно захищені.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs">
                                        <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">RSA-2048</div>
                                        <div className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold uppercase tracking-wider">Захищено</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Tracking Card */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-blue-500/50 transition-all group md:col-span-1">
                            <div className="flex flex-col xs:flex-row items-start gap-4 sm:gap-5">
                                <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl group-hover:bg-blue-600/20 shrink-0">
                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 w-full min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Відстеження Статусу</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mb-6 leading-relaxed">
                                        Моніторьте прогрес вашої заяви в режимі реального часу за допомогою візуальної системи статусів.
                                    </p>
                                    
                                    {/* Status Timeline - Responsive Scaling */}
                                    <div className="mt-4 flex items-center justify-between relative px-2 sm:px-4">
                                        <div className="absolute top-4 sm:top-5 left-4 right-4 h-0.5 bg-slate-700"></div>
                                        {[
                                            { s: 1, t: "Черн", active: true },
                                            { s: 2, t: "Нова", active: true },
                                            { s: 3, t: "Розгляд", active: false },
                                            { s: 4, t: "Фінал", active: false }
                                        ].map((item) => (
                                            <div key={item.s} className="relative flex flex-col items-center gap-2 z-10">
                                                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${item.active ? 'bg-blue-600' : 'bg-slate-700'} border-4 border-slate-800 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors`}>
                                                    {item.s}
                                                </div>
                                                <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-500">{item.t}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Card Preview */}
                        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 sm:p-8 hover:border-emerald-500/50 transition-all group">
                            <div className="flex flex-col xs:flex-row items-start gap-4 sm:gap-5">
                                <div className="p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl group-hover:bg-emerald-600/20 shrink-0">
                                    <UserCircle className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="flex-1 w-full min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Профіль студента</h3>
                                    <p className="text-sm sm:text-base text-slate-400 mb-6 leading-relaxed">
                                        Керуйте своїм профілем, завантажуйте фото та тримайте дані актуальними для адміністрації.
                                    </p>
                                    
                                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-900/60 border border-slate-700 rounded-2xl">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shrink-0">
                                            <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-2.5 bg-slate-700 rounded-full w-20 sm:w-24 mb-2"></div>
                                            <div className="h-2 bg-slate-800 rounded-full w-12 sm:w-16"></div>
                                        </div>
                                        <button className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold uppercase rounded-lg border border-blue-700 transition-all shrink-0">
                                            Оновити
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-32">
                    <div className="bg-slate-800/20 border border-slate-800 rounded-[2rem] p-6 sm:p-12 md:p-16 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-16">Як працює система</h2>
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 relative">
                            <StepItem icon={<CornerRightUp className="text-blue-400" />} step={1} title="Подання" desc="Заповніть форму та підпишіть заяву." />
                            <StepItem icon={<MessageSquare className="text-purple-400" />} step={2} title="Розгляд" desc="Деканат миттєво отримує запит." />
                            <StepItem icon={<CheckCircle className="text-emerald-400" />} step={3} title="Рішення" desc="Отримайте результат онлайн." />
                            <StepItem icon={<Archive className="text-amber-400" />} step={4} title="Архів" desc="Надійне зберігання документів." />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

const StepItem = ({ icon, step, title, desc }: { icon: React.ReactNode, step: number, title: string, desc: string }) => (
    <div className="relative flex flex-col items-center text-center group">
        <div className="mb-5 p-5 bg-slate-800 rounded-[1.25rem] border border-slate-700 group-hover:border-blue-500/50 transition-all relative shadow-xl">
            <div className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-[11px] font-black border-2 border-slate-900 shadow-lg">
                {step}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-full h-full" }) : icon}
            </div>
        </div>
        <h4 className="font-bold text-base sm:text-lg mb-2 text-slate-100">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed px-2">{desc}</p>
    </div>
);

export default InfoPage;