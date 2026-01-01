import React, { useState } from 'react';
import { Edit, Save, X, Trash2, Calendar, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ApplicationData {
    id: number;
    title: string;
    description: string;
    date: string;
    status: 'Draft' | 'Submitted' | 'Approved';
}

const MOCK_APPLICATION: ApplicationData = {
    id: 1001,
    title: 'Заява про переведення на інший факультет',
    description: 'Прошу розглянути можливість мого переведення з факультету прикладної математики на факультет комп’ютерних наук у зв’язку зі зміною пріоритетів навчання.',
    date: '2025-11-25',
    status: 'Draft',
};

const EditApplicationPage: React.FC = () => {
    const [application, setApplication] = useState<ApplicationData>(MOCK_APPLICATION);
    const [isEditing, setIsEditing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setApplication(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsLoading(true);

        // *** Тут має бути виклик API для збереження даних ***

        await new Promise(resolve => setTimeout(resolve, 1500)); // Імітація затримки API

        try {
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Заяву успішно збережено!' });
        } catch (error) {
            console.error("Save failed:", error);
            setMessage({ type: 'error', text: 'Помилка при збереженні. Спробуйте ще раз.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Ви впевнені, що хочете видалити цю заяву?')) return;
        
        setMessage(null);
        setIsLoading(true);

        // *** Тут має бути виклик API для видалення даних ***

        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            // Успішне видалення
            setMessage({ type: 'success', text: 'Заяву успішно видалено.' });
            setTimeout(() => navigate('/account'), 1000); // Перенаправити після видалення
        } catch (error) {
            console.error("Delete failed:", error);
            setMessage({ type: 'error', text: 'Помилка при видаленні. Спробуйте ще раз.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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

            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto w-full space-y-8 bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    
                    <div className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                            <Edit className="h-7 w-7 mr-3 text-teal-600 dark:text-teal-400" />
                            Редагування Заяви #{application.id}
                        </h2>
                        
                        <button
                            onClick={() => setIsEditing(prev => !prev)}
                            className={`flex items-center text-sm font-medium transition ${isEditing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-teal-500 hover:bg-teal-600 text-white'}`}
                            disabled={isLoading}
                        >
                            {isEditing ? (
                                <X className="h-4 w-4 mr-2" />
                            ) : (
                                <Edit className="h-4 w-4 mr-2" />
                            )}
                            {isEditing ? 'Скасувати редагування' : 'Редагувати'}
                        </button>
                    </div>

                    {message && (
                        <div className={`px-4 py-3 rounded-xl relative text-sm font-semibold transition ${message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`} role="alert">
                            <span className="block sm:inline">{message.text}</span>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                            Статус: 
                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${application.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : application.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                {application.status === 'Draft' ? 'Чернетка' : application.status === 'Submitted' ? 'Надіслано' : 'Схвалено'}
                            </span>
                        </p>
                        <p className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                            Дата створення: {application.date}
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSave}>
                        
                        <div>
                            <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Заголовок Заяви</label>
                            <input
                                id="title-input"
                                name="title"
                                type="text"
                                required
                                value={application.title}
                                onChange={handleChange}
                                readOnly={!isEditing || isLoading}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                placeholder="Короткий опис заяви"
                                disabled={!isEditing || isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="description-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текст Заяви</label>
                            <textarea
                                id="description-input"
                                name="description"
                                required
                                rows={8}
                                value={application.description}
                                onChange={handleChange}
                                readOnly={!isEditing || isLoading}
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                                placeholder="Детальний опис Вашої заяви..."
                                disabled={!isEditing || isLoading}
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            
                            <button
                                type="submit"
                                disabled={!isEditing || isLoading}
                                className="flex items-center py-2 px-4 text-sm font-medium rounded-xl text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition disabled:opacity-50 shadow-md"
                            >
                                {isLoading ? (
                                    <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-5 w-5 mr-2" />
                                )}
                                {isLoading ? 'Збереження...' : 'Зберегти зміни'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex items-center py-2 px-4 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition disabled:opacity-50 shadow-md"
                            >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Видалити Заяву
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <button 
                            onClick={() => navigate('/account')} 
                            className="text-xs text-gray-500 hover:text-teal-600 transition bg-transparent hover:bg-transparent p-0 border-0"
                        >
                            &larr; Повернутися до списку заяв
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditApplicationPage;