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
import AuthPage from './login.tsx';
import EditApplicationPage from './edit.tsx'

type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN'; 

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
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return element;
};


const App = () => {
    const IS_TESTING_MODE = true; 

    const initialToken = localStorage.getItem('authToken');
    const initialRole = localStorage.getItem('userRole') as UserRole | null;
    const initialUserDataString = localStorage.getItem('userData');
    
    const isAuthenticated = IS_TESTING_MODE || (!!initialToken && !!initialRole);
    
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: isAuthenticated, 
        token: initialToken,
        userRole: isAuthenticated ? (initialRole || 'STUDENT') : null,
        userData: initialUserDataString ? JSON.parse(initialUserDataString) : null,
    });
 
    const handleLogin = (token: string, userData: any) => {
        const role = userData?.roleName as UserRole;
        
        if (!token || !role) {
            console.error("Помилка: Не отримано токен або роль.");
            return;
        }

        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(userData));

        setAuthState({
            isAuthenticated: true,
            token: token,
            userRole: role,
            userData: userData,
        });
    };
    
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userData');
        
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
                
                <Route 
                    path="/" 
                    element={<InfoPage isAuthenticated={authState.isAuthenticated} />} 
                />
                
                <Route 
                    path="/login" 
                    element={
                        authState.isAuthenticated 
                            ? <Navigate to="/account" replace /> 
                            : <AuthPage handleLogin={handleLogin} /> 
                    } 
                />

                <Route 
                    path="/account" 
                    element={
                        <ProtectedRoute 
                            element={<StudentPortal 
                                handleLogout={handleLogout} 
                                userRole={authState.userRole}
                                userId={authState.userData?.userId}
                            />} 
                            isAuthenticated={authState.isAuthenticated} 
                        />
                    } 
                />

                <Route path="/:documentId/edit" element={<EditApplicationPage />

                } />

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