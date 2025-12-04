import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, Calendar, MessageSquare, Download, Eye, LogOut, Loader, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN';
const API_BASE_URL = 'http://localhost:8080/api/applications'; 

const APPLICATION_TYPE_MAP: { [key: string]: number } = {
    'Довідка про навчання': 1,
    'Академічна відпустка': 2,
    'Переведення на бюджет': 3,
    'Перенесення сесії': 4, 
    'Відрахування за власним бажанням': 5,
    'Поновлення на навчання': 6,
    'Довідка-виклик': 7,
    'Матеріальна допомога': 8
};

interface StudentPortalProps {
    handleLogout: () => void;
    userRole: UserRole | null;
    userId: number | null;
}

interface MyApplication {
  id: number;
  studentName?: string;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review' | 'нова';
  comment?: string;
  rejectionReason?: string;
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'pending':
    case 'нова': return <Clock className="w-5 h-5 text-blue-500" />;
    case 'in-review': return <Eye className="w-5 h-5 text-yellow-500" />;
    case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
    default: return null;
  }
};

const getStatusText = (status: string) => {
  const statusMap = {
    нова: 'Нова (Очікує)',
    pending: 'Очікує розгляду',
    'in-review': 'В обробці',
    approved: 'Затверджено',
    rejected: 'Відхилено'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusColor = (status: string) => {
  const colorMap = {
    нова: 'border-blue-200 bg-blue-50',
    pending: 'border-blue-200 bg-blue-50',
    'in-review': 'border-yellow-200 bg-yellow-50',
    approved: 'border-green-200 bg-green-50',
    rejected: 'border-red-200 bg-red-50'
  };
  return colorMap[status as keyof typeof colorMap] || 'border-slate-200 bg-white';
};

const LecturerView: React.FC<StudentPortalProps> = ({ handleLogout, userRole, userId }) => {
    const [applications, setApplications] = useState<MyApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllApplications = async () => {
            if (userRole !== 'LECTURER' && userRole !== 'ADMIN') return;
            const token = localStorage.getItem('authToken');
            
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE_URL}/all`, { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json(); 
                    const mappedApplications: MyApplication[] = data.map((app: any) => ({
                        id: app.applicationId,
                        type: app.applicationType?.typeName || 'Незн. тип',
                        date: app.createdDate.split('T')[0],
                        status: app.applicationStatus?.statusName?.toLowerCase() || 'pending',
                        studentName: app.student?.fullName || app.student?.username, 
                        comment: app.content, 
                        rejectionReason: app.rejectionReason,
                    }));
                    setApplications(mappedApplications);
                } else if (response.status === 403) {
                    setError('Недостатньо прав для перегляду всіх заявок.');
                } else {
                    setError('Помилка завантаження списку заявок.');
                }
            } catch (err) {
                setError('Помилка мережі при завантаженні заявок викладача.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllApplications();
    }, [userRole, userId]);

    const handleConfirm = (id: number) => {
        //Тут буде реальний PUT-запит на /api/applications/{id}/confirm
        alert(`Підтвердити заявку #${id}. (PUT /confirm)`);
    };

    const handleReject = (id: number) => {
        const reason = prompt(`Введіть причину відхилення заявки #${id}:`);
        if (reason) {
            //Тут буде реальний PUT-запит на /api/applications/{id}/reject з reason
            alert(`Заявка #${id} відхилена з причиною: ${reason}. (PUT /reject)`);
        }
    };
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Заяви на розгляді ({applications.length})</h2>
                <p className="text-sm text-slate-500 mt-1">Всього заявок, доступних для {userRole}</p>
            </div>

            {loading && <div className="p-6 text-center text-orange-600"><Loader className="w-5 h-5 animate-spin inline mr-2" /> Завантаження всіх заявок...</div>}
            {error && <div className="p-6 text-center text-red-600 bg-red-50"><AlertTriangle className="w-5 h-5 inline mr-2" /> {error}</div>}
            
            {!loading && !error && applications.length > 0 && (
                <div className="p-6 space-y-4">
                    {applications.map((app) => (
                        <div 
                            key={app.id} 
                            className={`border-2 rounded-xl p-5 transition hover:shadow-md ${getStatusColor(app.status)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{app.type} (ID: {app.id})</h3>
                                    <p className="text-sm text-slate-700">Студент: <span className="font-medium">{app.studentName}</span></p>
                                    <div className="text-sm text-slate-600 mt-1">Подано: {new Date(app.date).toLocaleDateString()}</div>
                                </div>
                                
                                {/* КНОПКИ ДЛЯ ВИКЛАДАЧА */}
                                {(app.status === 'pending' || app.status === 'нова') && (
                                    <div className="flex space-x-2 ml-4 flex-col sm:flex-row">
                                        <button 
                                            onClick={() => handleConfirm(app.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1 inline" /> Підтвердити
                                        </button>
                                        <button 
                                            onClick={() => handleReject(app.id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium mt-1 sm:mt-0"
                                        >
                                            <XCircle className="w-4 h-4 mr-1 inline" /> Відхилити
                                        </button>
                                    </div>
                                )}
                                {app.status !== 'pending' && app.status !== 'нова' && (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm">{getStatusText(app.status)}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!loading && !error && applications.length === 0 && (
                <div className="p-10 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto mb-3" />
                    <p>Наразі немає активних заявок для розгляду.</p>
                </div>
            )}
        </div>
    );
};


const StudentPortal: React.FC<StudentPortalProps> = ({ handleLogout, userRole, userId }) => {
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [newApplicationDescription, setNewApplicationDescription] = useState('');
  const [passwordForSign, setPasswordForSign] = useState('');

  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const studentInfo = {
    name: 'Іванов Іван Петрович',
    group: 'КН-301',
    course: '3 курс',
    faculty: 'Факультет комп\'ютерних наук',
    studentId: 'ST2022001247'
  };

  const applicationTypes = Object.keys(APPLICATION_TYPE_MAP);

  useEffect(() => {
    const fetchMyApplications = async () => {
        if (userRole !== 'STUDENT') return; 
        const token = localStorage.getItem('authToken');
        
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/my`, { 
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json(); 
                const mappedApplications: MyApplication[] = data.map((app: any) => ({
                    id: app.applicationId,
                    type: app.applicationType?.typeName || app.title,
                    date: app.createdDate.split('T')[0],
                    status: app.applicationStatus?.statusName?.toLowerCase() || 'pending',
                    comment: app.rejectionReason || app.content, 
                    rejectionReason: app.rejectionReason,
                }));
                
                setApplications(mappedApplications);
            } else if (response.status === 403) {
                setError('Сесія закінчилася або у вас немає прав.');
            } else {
                setError('Не вдалося завантажити заявки.');
            }
        } catch (err) {
            setError('Помилка мережі. Не вдалося підключитися до сервера.');
        } finally {
            setLoading(false);
        }
    };
    
    if (userRole === 'STUDENT') {
        fetchMyApplications();
    }
  }, [userRole, userId]);

  const addApplication = async () => {
    // 1. Валідація
    if (!selectedType || newApplicationDescription.trim() === '' || !passwordForSign) {
        alert("Будь ласка, оберіть тип, введіть опис та пароль.");
        return;
    }

    const typeId = APPLICATION_TYPE_MAP[selectedType];
    if (!typeId) {
        alert("Недійсний тип заяви.");
        return;
    }

    const formData = new FormData();
    formData.append('typeId', typeId.toString());
    formData.append('title', selectedType);
    formData.append('content', newApplicationDescription);
    formData.append('password', passwordForSign);
    
    if (selectedFile) {
        formData.append('file', selectedFile); 
    }

    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch(`${API_BASE_URL}/sign-submit`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, 
            },
            body: formData,
        });

        if (response.ok) {
            const newAppResponse = await response.json(); 
            
            const newApp: MyApplication = { 
                id: newAppResponse.applicationId, 
                type: newAppResponse.applicationType?.typeName || selectedType,
                date: new Date(newAppResponse.createdDate).toISOString().split('T')[0],
                status: newAppResponse.applicationStatus?.statusName?.toLowerCase() || 'нова', 
                comment: newAppResponse.content
            };

            setApplications(prev => [newApp, ...prev]);
            setShowNewApplicationModal(false);
            setSelectedType('');
            setNewApplicationDescription('');
            setPasswordForSign('');
            setSelectedFile(null);
            setError(null); 

        } else if (response.status === 401) {
             alert("Помилка підпису: Невірний пароль для підтвердження.");
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Невідома помилка сервера.' }));
            alert(`Помилка подачі заявки: ${errorData.message}`);
        }
    } catch (error) {
        alert("Не вдалося підключитися до сервера. Перевірте мережу.");
    }
};


  const PortalHeader = (title: string, subtitle: string, initials: string) => (
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{title}</h1>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right mr-3 hidden sm:block">
                  <p className="font-medium text-slate-900">{studentInfo.name}</p>
                  <p className="text-sm text-slate-500">{userRole}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {initials}
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                  title="Вихід"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
  );

// 4. Рендеринг для ВИКЛАДАЧА
  if (userRole === 'LECTURER' || userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        {PortalHeader("Панель Викладача", `Роль: ${userRole}`, "ВК")}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LecturerView handleLogout={handleLogout} userRole={userRole} userId={userId} /> 
        </main>
      </div>
    );
  }
  
// 5. Рендеринг для СТУДЕНТА
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {PortalHeader("Особистий кабінет", "Студентський портал", "ІІ")}
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        ІІ
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">{studentInfo.name}</h2>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                            <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {studentInfo.studentId}
                            </span>
                            <span>•</span>
                            <span>{studentInfo.group}</span>
                            <span>•</span>
                            <span>{studentInfo.course}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{studentInfo.faculty}</p>
                    </div>
                </div>
                <button 
                  onClick={() => setShowNewApplicationModal(true)}
                  className="flex items-center px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium shadow-lg shadow-blue-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Нова заява
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{applications.filter(a => a.status === 'pending' || a.status === 'in-review' || a.status === 'нова').length}</p>
                        <p className="text-sm text-slate-600">Активні заяви</p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-500 opacity-50" />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === 'approved').length}</p>
                        <p className="text-sm text-slate-600">Затверджено</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-slate-600">{applications.length}</p>
                        <p className="text-sm text-slate-600">Всього заяв</p>
                    </div>
                    <FileText className="w-8 h-8 text-slate-500 opacity-50" />
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-bold text-purple-600">3.8</p>
                        <p className="text-sm text-slate-600">Середній бал</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-purple-500 opacity-50" />
                </div>
            </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Мої заяви</h2>
            <p className="text-sm text-slate-500 mt-1">Історія поданих заяв та їх статус</p>
          </div>

          {/* 6. ІНДИКАТОРИ СТАНУ ЗАВАНТАЖЕННЯ/ПОМИЛКИ */}
          {loading && (
            <div className="p-6 text-center text-blue-600 flex items-center justify-center space-x-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Завантаження ваших заявок...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 text-center text-red-600 flex items-center justify-center space-x-2 bg-red-50">
                <AlertTriangle className="w-5 h-5" />
                <span>Помилка: {error}</span>
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="p-10 text-center text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-3" />
                <p>У вас ще немає поданих заявок.</p>
                <button 
                  onClick={() => setShowNewApplicationModal(true)}
                  className="mt-4 text-blue-600 hover:underline"
                >Подати першу заяву</button>
            </div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="p-6 space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className={`border-2 rounded-xl p-5 transition hover:shadow-md ${getStatusColor(app.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(app.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 text-lg mb-1">{app.type}</h3>
                      <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Подано: {new Date(app.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      {app.comment && (
                        <div className="flex items-start space-x-2 text-sm text-slate-700 bg-white/50 rounded-lg p-3 mt-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>{app.comment}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-white shadow-sm">
                      {getStatusText(app.status)}
                    </span>
                      {(app.status === 'pending' || app.status === 'нова') && (
                          <div className="flex space-x-2">
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                                    <Edit3 className='w-4 h-4 mr-1' /> Редагувати
                                </button>
                              <button className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
                                    <Trash2 className='w-4 h-4 mr-1' /> Видалити
                                </button>
                          </div>
                      )}

                    {app.status === 'approved' && (
                      <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                        <Download className="w-4 h-4 mr-1" />
                        Завантажити
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>

      {showNewApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Нова заява</h3>
            <p className="text-sm text-slate-600 mb-6">1. Оберіть тип, 2. Опис, 3. Пароль для підпису</p>
            
            <div className="space-y-3 mb-6 grid grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-2">
              {applicationTypes.map((type, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition text-sm ${
                    selectedType === type 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-semibold' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* 2. ПОЛЕ ДЛЯ ОПИСУ ЗАЯВИ */}
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">Детальний опис заяви</label>
                <textarea
                    id="description"
                    rows={3}
                    value={newApplicationDescription}
                    onChange={(e) => setNewApplicationDescription(e.target.value)}
                    placeholder="Введіть тут деталі вашої заяви..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-700 resize-none"
                ></textarea>
            </div>

            {/* 3. ДОДАТИ ПОЛЕ ДЛЯ ФАЙЛУ */}
            <div className="mb-6">
                <label htmlFor="application-file" className="block text-sm font-medium text-slate-700 mb-2">
                    Прикріпити файл (PDF, JPG, DOCX)
                </label>
                <input
                    id="application-file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
            </div>

             {/* 4. ПАРОЛЬ ДЛЯ ПІДПИСУ */}
            <div className="mb-6">
                <label htmlFor="sign-password" className="block text-sm font-medium text-slate-700 mb-2">Пароль для підтвердження (ЕЦП)</label>
                <input
                    id="sign-password"
                    type="password"
                    value={passwordForSign}
                    onChange={(e) => setPasswordForSign(e.target.value)}
                    placeholder="Введіть ваш пароль для цифрового підпису"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-slate-700"
                />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewApplicationModal(false);
                  setSelectedType('');
                  setNewApplicationDescription('');
                  setPasswordForSign('');
                }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
              >
                Скасувати
              </button>
              <button
                onClick={addApplication}
                disabled={!selectedType || newApplicationDescription.trim() === '' || passwordForSign.length < 3}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Подати та Підписати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;