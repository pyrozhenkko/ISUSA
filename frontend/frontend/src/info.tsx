import React from 'react'; 
import { User, LogIn, LayoutDashboard, Zap, FileText, ArrowRight, CornerRightUp, MessageSquare, CheckCircle, Archive } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// 1. ОНОВЛЕННЯ ІНТЕРФЕЙСУ ПРОПСІВ
interface InfoPageProps {
    isAuthenticated: boolean; 
}

const InfoPage: React.FC<InfoPageProps> = ({ isAuthenticated }) => {
    
    const navigate = useNavigate(); 
    
    // Імітація імені. У реальному додатку можна було б взяти з localStorage.getItem('userData')
    const userName = "Користувач системи"; 
    
    // 2. ОНОВЛЕНА ЛОГІКА ДІЇ КНОПОК
    const handleAuthAction = () => {
        if (!isAuthenticated) {
            // Якщо користувач НЕ авторизований, перенаправляємо на /login
            navigate('/login'); 
        } else {
            // Якщо авторизований: перенаправляємо в кабінет
            navigate('/account'); 
        }
    };

    // 3. Динамічний блок авторизації
    const AuthButton = () => {
        const text = isAuthenticated ? 'Мій акаунт' : 'Вхід'; 
        const Icon = isAuthenticated ? LayoutDashboard : LogIn;

        return (
            <button
                onClick={handleAuthAction}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-teal-700 transition font-medium text-base"
            >
                <Icon className="w-5 h-5 mr-2" />
                {text}
            </button>
        );
    };
    
    // Новий компонент для кроків інструкції
    const StepCard: React.FC<{ icon: React.ReactNode, title: string, description: string, step: number }> = ({ icon, title, description, step }) => (
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-teal-100 text-teal-600 font-bold text-lg mb-4">
                {step}
            </div>
            {React.cloneElement(icon as React.ReactElement)}
            <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 1. ХЕДЕР (Візитка та Кнопка Входу) */}
            <header className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    {/* Лого/Назва Системи */}
                    <div className="flex items-center space-x-3">
                        <Link to={'/'}>
                            <Zap className="w-7 h-7 text-teal-600" />
                        </Link>
                        <Link to={'/'}>
                            <h1 className="text-2xl font-bold text-gray-900">ІСУСЗ Портал</h1>
                        </Link>
                    </div>
                    
                    {/* Динамічна Кнопка Авторизації */}
                    {AuthButton()}
                </div>
            </header>

            {/* 2. ГОЛОВНА СЕКЦІЯ (Опис Системи) */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                
                {/* 2.1 Блок Заголовка */}
                <div className="text-center mb-16">
                    <h2 className="text-5xl font-extrabold text-gray-900 leading-tight">
                        Інформаційна Система Управління <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-600">Студентськими Заявами</span>
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                        Ваш швидкий, прозорий та сучасний шлях взаємодії з адміністрацією університету.
                    </p>
                </div>
                
                {/* 2.2 Блок Переваг */}
                <section className="mb-20">
                    <h3 className="text-3xl font-bold text-gray-900 text-center mb-10">Ключові переваги</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        
                        <div className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-teal-500 transform hover:scale-[1.02] transition duration-300">
                            <FileText className="w-10 h-10 text-teal-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Без паперів</h3>
                            <p className="text-gray-600">Подавайте, відстежуйте та отримуйте рішення по заявах повністю онлайн. Мінімум бюрократії.</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-teal-500 transform hover:scale-[1.02] transition duration-300">
                            <Zap className="w-10 h-10 text-teal-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Миттєве сповіщення</h3>
                            <p className="text-gray-600">Отримуйте email-сповіщення про зміну статусу заяви одразу після рішення деканату.</p>
                        </div>
                        
                        <div className="bg-white p-8 rounded-xl shadow-xl border-t-4 border-teal-500 transform hover:scale-[1.02] transition duration-300">
                            <User className="w-10 h-10 text-teal-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Прозорість</h3>
                            <p className="text-gray-600">Відстежуйте кожен етап розгляду вашої заяви: від подачі до архівування.</p>
                        </div>
                    </div>
                </section>

                {/* 2.3 НОВА СЕКЦІЯ: Як це працює */}
                <section className="mb-20 bg-teal-50 p-10 rounded-2xl shadow-inner">
                    <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">4 кроки до готової заяви</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        
                        <StepCard 
                            step={1}
                            icon={<CornerRightUp />}
                            title="Створення та Подання"
                            description="Заповніть електронну форму заяви у своєму кабінеті, підпишіть КЕП (за потреби) та надішліть."
                        />
                        
                        <StepCard 
                            step={2}
                            icon={<MessageSquare />}
                            title="Перевірка та Розгляд"
                            description="Деканат автоматично отримує заяву та починає її розгляд. Ви бачите поточний статус."
                        />
                        
                        <StepCard 
                            step={3}
                            icon={<CheckCircle />}
                            title="Схвалення та Рішення"
                            description="Отримайте офіційне рішення в електронному вигляді. Вам надійде миттєве сповіщення."
                        />
                        
                        <StepCard 
                            step={4}
                            icon={<Archive />}
                            title="Зберігання"
                            description="Ваша заява та рішення зберігаються в архіві системи, доступному у будь-який час."
                        />
                    </div>
                </section>


                {/* 2.4 CTA (Call to Action) */}
                <div className="text-center mt-16">
                    <button
                        onClick={handleAuthAction}
                        className="inline-flex items-center px-8 py-4 bg-teal-600 text-white text-xl font-bold rounded-full shadow-2xl shadow-teal-300 hover:bg-teal-700 transition transform hover:scale-105"
                    >
                        Почати роботу
                        <ArrowRight className="w-5 h-5 ml-3" />
                    </button>
                    {/* Замінено authStatus !== 'loggedOut' на isAuthenticated */}
                    {isAuthenticated && (
                        <p className="mt-4 text-sm text-gray-500">
                            Авторизовано як: <span className="font-semibold text-teal-600">{userName}</span>
                        </p>
                    )}
                </div>

            </main>
            
            {/* 3. ФУТЕР */}
            <footer className="bg-gray-800 text-white py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} ІСУСЗ. Всі права захищені.</p>
                </div>
            </footer>
        </div>
    );
};

export default InfoPage;