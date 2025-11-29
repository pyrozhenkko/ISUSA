import React, { useState } from 'react';
import { User, Lock, ArrowRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Інтерфейс для пропсів, отриманих від App.tsx
interface LoginPageProps {
    handleLogin: (token: string, userData: any) => void;
}

const API_URL = 'http://localhost:8080/api/auth/login';

const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Додаємо стан завантаження
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

        const loginPayload = {
            // Ключі повинні відповідати полям у LoginRequestDto на Java бекенді
            username: username,
            password: password,
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginPayload),
            });

            if (response.ok) {
                // Вхід успішний
                const data = await response.json();
                
                // 1. Збереження токена та даних користувача, зміна глобального стану
                handleLogin(data.token, data.user); 
                
                // 2. Перенаправлення користувача
                navigate('/account');

            } else if (response.status === 401) {
                // Неавторизовано (зазвичай BadCredentialsException)
                setError('Невірний логін або пароль. Спробуйте ще раз.');
            } else {
                // Інші помилки (500, 404, 400 тощо)
                setError('Помилка сервера. Спробуйте пізніше.');
            }
        } catch (err) {
            // Помилка мережі (наприклад, бекенд не відповідає)
            console.error("Login failed:", err);
            setError('Не вдалося підключитися до сервера. Перевірте мережу.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl border border-gray-200">
                
                {/* Заголовок */}
                <div>
                    <Zap className="mx-auto h-12 w-auto text-teal-600" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Вхід до ІСУСЗ Порталу
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        <Link to="/" className="font-medium text-teal-600 hover:text-teal-500">
                            Інформаційна сторінка
                        </Link>
                    </p>
                </div>

                {/* Форма Входу */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* Поле Логін (Username) */}
                        <div>
                            <label htmlFor="login-input" className="sr-only">Логін (ID студента)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="login-input"
                                    name="username" // Змінено на username
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    placeholder="Логін (ID студента)"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        
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
                                    className="appearance-none rounded-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    placeholder="Пароль"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Кнопка Увійти */}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className="h-5 w-5 text-teal-300 group-hover:text-white" />
                            </span>
                            {isLoading ? 'Вхід...' : 'Увійти'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;