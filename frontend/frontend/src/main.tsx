import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { 
    BrowserRouter, 
    Routes, 
    Route, 
    Navigate,
    Link
} from 'react-router-dom';
import './index.css';

import StudentPortal from './main-page.tsx';
import InfoPage from './info.tsx'; 
import LoginPage from './login.tsx';

type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN'; 

// Структура глобального стану автентифікації
interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    userRole: UserRole | null;
    userData: { userId: number } | any | null;
}

interface ProtectedRouteProps {
    element: React.ReactElement;
    isAuthenticated: boolean; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, isAuthenticated }) => {
    // Якщо користувач не авторизований, перенаправляємо на сторінку входу
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return element;
};


const App = () => {
    // 1. ІНІЦІАЛІЗАЦІЯ СТАНУ З Local Storage (для збереження сесії)
    const initialToken = localStorage.getItem('authToken');
    const initialRole = localStorage.getItem('userRole') as UserRole | null;
    const initialUserDataString = localStorage.getItem('userData');
    
    // Перевіряємо, чи є токен І роль для вважання користувача авторизованим
    const isAuthenticated = !!initialToken && !!initialRole;
    
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: isAuthenticated, 
        token: initialToken,
        userRole: initialRole,
        userData: initialUserDataString ? JSON.parse(initialUserDataString) : null,
    });
    
    // 2. ФУНКЦІЯ ВХОДУ (викликається з LoginPage)
    // data.token та data.user приходять з LoginResponseDto
    const handleLogin = (token: string, userData: any) => {
        const role = userData?.roleName as UserRole;
        
        if (!token || !role) {
            console.error("Помилка: Не отримано токен або роль.");
            return;
        }

        // Зберігаємо дані в Local Storage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(userData));

        // Оновлюємо стан
        setAuthState({
            isAuthenticated: true,
            token: token,
            userRole: role,
            userData: userData,
        });
    };
    
    // 3. ФУНКЦІЯ ВИХОДУ
    const handleLogout = () => {
        // Очищаємо Local Storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        
        // Оновлюємо стан
        setAuthState({
            isAuthenticated: false,
            token: null,
            userRole: null,
            userData: null,
        });
    };

    return (
        <BrowserRouter>
            <Routes>
                
                {/* 1. ГОЛОВНА / ПУБЛІЧНА СТОРІНКА */}
                <Route 
                    path="/" 
                    // Передаємо лише стан авторизації у InfoPage
                    element={<InfoPage isAuthenticated={authState.isAuthenticated} />} 
                />
                
                {/* 2. МАРШРУТ ВХОДУ (/login) */}
                <Route 
                    path="/login" 
                    element={
                        // Якщо вже авторизований -> перенаправляємо в кабінет
                        authState.isAuthenticated 
                            ? <Navigate to="/account" replace /> 
                            // Інакше показуємо сторінку входу
                            : <LoginPage handleLogin={handleLogin} /> 
                    } 
                />

                {/* 3. МАРШРУТ ОСОБИСТОГО КАБІНЕТУ (/account) - ЗАХИЩЕНИЙ */}
                <Route 
                    path="/account" 
                    element={
                        <ProtectedRoute 
                            // Передаємо handleLogout та дані для StudentPortal
                            element={<StudentPortal 
                                handleLogout={handleLogout} 
                                userRole={authState.userRole}
                                userId={authState.userData?.userId} // Використовуємо userId з userData
                            />} 
                            isAuthenticated={authState.isAuthenticated} 
                        />
                    } 
                />

                {/* 4. Маршрут 404 */}
                <Route path="*" element={
                    <div className="text-center p-10">
                        <h1 className="text-3xl font-bold">404</h1>
                        <p>Сторінка не знайдена.</p>
                        <Link to="/" className="text-blue-600 underline">Повернутися на головну</Link>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);