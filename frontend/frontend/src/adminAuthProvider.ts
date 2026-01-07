import { type AuthProvider } from 'react-admin';

export const adminAuthProvider: AuthProvider = {
    login: ( ) => {
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        return Promise.resolve();
    },
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('authToken');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    checkAuth: () => {
        const token = localStorage.getItem('authToken');
        const role = localStorage.getItem('userRole'); 

        if (token && role === 'ADMIN') {
            return Promise.resolve();
        }
        
        return Promise.reject({ redirectTo: '/login' });
    },
    getPermissions: () => {
        const role = localStorage.getItem('userRole');
        return Promise.resolve(role);
    },
};