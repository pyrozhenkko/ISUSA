import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Інтерфейс для пропсів, отриманих від App.tsx
interface LoginPageProps {
    handleLogin: (token: string, userData: any) => void;
}

// Припускаємо, що API реєстрації знаходиться на /api/auth/register
const LOGIN_API_URL = 'http://localhost:8080/api/auth/login';
const REGISTER_API_URL = 'http://localhost:8080/api/auth/register';

const AuthPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    // Стан для форми
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // Додано для реєстрації
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Стан для перемикання між режимами
    const [isLoginMode, setIsLoginMode] = useState(true); // true = Вхід, false = Реєстрація

    const navigate = useNavigate();

    const modeTitle = isLoginMode ? 'Вхід до ІСУСЗ Порталу' : 'Реєстрація нового акаунту';
    const buttonText = isLoginMode ? 'Увійти' : 'Зареєструватися';
    const apiEndpoint = isLoginMode ? LOGIN_API_URL : REGISTER_API_URL;

    // Скидання полів при перемиканні режиму
    const toggleMode = () => {
        setIsLoginMode(prev => !prev);
        setError('');
        setUsername('');
        setPassword('');
        setEmail('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // 1. Валідація
        if (!username || !password || (!isLoginMode && !email)) {
            setError('Будь ласка, заповніть всі необхідні поля.');
            setIsLoading(false);
            return;
        }

        // 2. Підготовка payload
        const payload = isLoginMode
            ? { username, password } // Login
            : { username, password, email }; // Registration (залежить від DTO на бекенді)

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                if (isLoginMode) {
                    // Успішний вхід
                    const data = await response.json();
                    handleLogin(data.token, data.user); 
                    navigate('/account');
                } else {
                    // Успішна реєстрація
                    // Можемо одразу увійти або попросити увійти
                    setError('Реєстрація успішна! Спробуйте увійти, використовуючи Ваші дані.');
                    setIsLoginMode(true); // Перемикаємо на режим входу
                }
            } else {
                // Обробка помилок
                const errorData = await response.json().catch(() => ({ message: 'Помилка' }));
                
                if (response.status === 401) {
                    // Неавторизовано
                    setError('Невірний логін або пароль.');
                } else if (response.status === 409 && !isLoginMode) {
                    // Conflict - 409 зазвичай для вже існуючого користувача при реєстрації
                    setError('Користувач з таким логіном або email вже існує.');
                } else if (response.status >= 400 && response.status < 500) {
                    // Інші клієнтські помилки (400 Bad Request)
                    setError(errorData.message || 'Помилка в даних форми. Перевірте введення.');
                } else {
                    // Помилка сервера
                    setError('Помилка сервера. Спробуйте пізніше.');
                }
            }
        } catch (err) {
            console.error("Auth failed:", err);
            setError('Не вдалося підключитися до сервера. Перевірте мережу.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Глобальні стилі, додані на запит користувача */}
            <style dangerouslySetInnerHTML={{__html: `
                :root {
                    font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
                    line-height: 1.5;
                    font-weight: 400;

                    color-scheme: light dark;
                    color: rgba(255, 255, 255, 0.87);
                    background-color: #242424;

                    font-synthesis: none;
                    text-rendering: optimizeLegibility;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }

                a {
                    font-weight: 500;
                    color: #646cff;
                    text-decoration: inherit;
                }
                a:hover {
                    color: #535bf2;
                }

                body {
                    margin: 0;
                    min-width: 320px;
                    min-height: 100vh;
                }

                h1 {
                    font-size: 3.2em;
                    line-height: 1.1;
                }

                button {
                    border-radius: 8px;
                    border: 1px solid transparent;
                    padding: 0.6em 1.2em;
                    font-size: 1em;
                    font-weight: 500;
                    font-family: inherit;
                    background-color: #1a1a1a;
                    cursor: pointer;
                    transition: border-color 0.25s;
                }
                button:hover {
                    border-color: #646cff;
                }
                button:focus,
                button:focus-visible {
                    outline: 4px auto -webkit-focus-ring-color;
                }

                @media (prefers-color-scheme: light) {
                    :root {
                        color: #213547;
                        background-color: #ffffff;
                    }
                    a:hover {
                        color: #747bff;
                    }
                    button {
                        background-color: #f9f9f9;
                    }
                }
            `}} />
            
            {/* Видалено bg-gray-100, щоб фон контролювався глобальним :root стилем */}
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300">
                    
                    {/* Заголовок */}
                    <div>
                        <Zap className="mx-auto h-12 w-auto text-teal-600 dark:text-teal-400 animate-pulse" />
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            {modeTitle}
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            {isLoginMode ? (
                                <span>
                                    Не маєте акаунту?{' '}
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 underline transition bg-transparent hover:bg-transparent p-0 border-0"
                                        disabled={isLoading}
                                    >
                                        Зареєструватися
                                    </button>
                                </span>
                            ) : (
                                <span>
                                    Вже маєте акаунт?{' '}
                                    <button
                                        type="button"
                                        onClick={toggleMode}
                                        className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 underline transition bg-transparent hover:bg-transparent p-0 border-0"
                                        disabled={isLoading}
                                    >
                                        Увійти
                                    </button>
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Форма */}
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative text-sm animate-pulse-once" role="alert">
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}

                        <div className="rounded-xl shadow-sm space-y-3">
                            
                            {/* Поле Логін (Username) */}
                            <div>
                                <label htmlFor="username-input" className="sr-only">Логін (ID студента)</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="username-input"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        placeholder="Логін (ID студента)"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Поле Email (Тільки для реєстрації) */}
                            {!isLoginMode && (
                                <div className="pt-2">
                                    <label htmlFor="email-input" className="sr-only">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            id="email-input"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                            placeholder="Email (Електронна пошта)"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Поле Пароль */}
                            <div>
                                <label htmlFor="password-input" className="sr-only">Пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        id="password-input"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                        placeholder="Пароль"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Кнопка дії */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50 shadow-lg shadow-teal-500/50"
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-teal-200" />
                                    ) : (
                                        <ArrowRight className="h-5 w-5 text-teal-300 group-hover:text-white transition" />
                                    )}
                                </span>
                                {isLoading ? (isLoginMode ? 'Вхід...' : 'Реєстрація...') : buttonText}
                            </button>
                        </div>
                    </form>
                    
                    {/* Додаткове посилання */}
                    <div className="text-center mt-4">
                        <Link to="/" className="text-xs text-gray-500 hover:text-teal-600 transition">
                            &larr; На головну сторінку
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

// Змінив експорт з LoginPage на AuthPage, щоб краще відображати його функціональність
export default AuthPage;