import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, Calendar, MessageSquare, Download, Eye, LogOut, Loader, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

type UserRole = 'STUDENT' | 'LECTURER' | 'ADMIN';
const API_BASE_URL = 'http://localhost:8081/api/applications'; 

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
    nova: 'Нова (Очікує)',
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

// --- VIEW ДЛЯ ВИКЛАДАЧА ---
const LecturerView: React.FC<StudentPortalProps> = ({ userRole, userId }) => {
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
        alert(`Підтвердити заявку #${id}. (PUT /confirm)`);
    };

    const handleReject = (id: number) => {
        const reason = prompt(`Введіть причину відхилення заявки #${id}:`);
        if (reason) {
            alert(`Заявка #${id} відхилена з причиною: ${reason}. (PUT /reject)`);
        }
    };
    
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Заяви на розгляді ({applications.length})</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Доступно для ролі: {userRole}</p>
            </div>

            <div className="p-4 sm:p-6">
                {loading && <div className="text-center py-10 text-blue-600"><Loader className="w-6 h-6 animate-spin inline mr-2" /> Завантаження...</div>}
                {error && <div className="p-4 text-center text-red-600 bg-red-50 rounded-xl"><AlertTriangle className="w-5 h-5 inline mr-2" /> {error}</div>}
                
                {!loading && !error && applications.length > 0 && (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div key={app.id} className={`border-2 rounded-xl p-4 sm:p-5 transition hover:shadow-md ${getStatusColor(app.status)}`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1">{app.type} (ID: {app.id})</h3>
                                        <p className="text-sm text-slate-700 font-medium">Студент: {app.studentName}</p>
                                        <div className="text-xs text-slate-500 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> Подано: {new Date(app.date).toLocaleDateString()}</div>
                                        {app.comment && <div className="mt-3 text-sm p-3 bg-white/50 rounded-lg border border-white/20 italic">"{app.comment}"</div>}
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col gap-2 shrink-0">
                                        {(app.status === 'pending' || app.status === 'нова') ? (
                                            <>
                                                <button onClick={() => handleConfirm(app.id)} className="flex-1 md:w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm font-bold shadow-sm">
                                                    <CheckCircle className="w-4 h-4 mr-1 inline" /> Підтвердити
                                                </button>
                                                <button onClick={() => handleReject(app.id)} className="flex-1 md:w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm font-bold shadow-sm">
                                                    <XCircle className="w-4 h-4 mr-1 inline" /> Відхилити
                                                </button>
                                            </>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/80 border border-current self-start md:self-end">
                                                {getStatusText(app.status)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && !error && applications.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Наразі немає активних заявок.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- ГОЛОВНИЙ ПОРТАЛ СТУДЕНТА ---
const StudentPortal: React.FC<StudentPortalProps> = ({ handleLogout, userRole, userId }) => {
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [newApplicationDescription, setNewApplicationDescription] = useState('');
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmedToSign, setIsConfirmedToSign] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const approvedCount = applications.filter(a => a.status === 'approved').length;
  const activeCount = applications.filter(a => ['pending', 'in-review', 'нова'].includes(a.status)).length;
  const totalCount = applications.length;

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
                    type: app.applicationType?.typeName || app.title || "Заява",
                    date: app.createdDate.split('T')[0],
                    status: app.applicationStatus?.statusName?.toLowerCase() || 'pending',
                    comment: app.content, 
                    rejectionReason: app.rejectionReason,
                }));
                setApplications(mappedApplications);
            } else {
                setError('Не вдалося завантажити список заявок.');
            }
        } catch (err) {
            setError('Помилка мережі при з’єднанні з сервером.');
        } finally {
            setLoading(false);
        }
    };
    fetchMyApplications();
  }, [userRole, userId]);

  const addApplication = async () => {
    if (!selectedType || newApplicationDescription.trim() === '' || !isConfirmedToSign) {
        alert("Будь ласка, заповніть всі поля.");
        return;
    }

    const typeId = APPLICATION_TYPE_MAP[selectedType];
    const token = localStorage.getItem('authToken');
    const requestBody = {
        typeId: typeId,
        title: selectedType,
        content: newApplicationDescription,
        password: "USER_CONFIRMED"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/sign-submit`, { 
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const newAppResponse = await response.json(); 
            const newApp: MyApplication = { 
                id: newAppResponse.applicationId, 
                type: newAppResponse.applicationType?.typeName || selectedType,
                date: new Date().toISOString().split('T')[0],
                status: 'нова', 
                comment: newAppResponse.content
            };
            setApplications(prev => [newApp, ...prev]);
            setShowNewApplicationModal(false);
            setNewApplicationDescription('');
            setSelectedType('');
            setIsConfirmedToSign(false);
        } else {
            alert("Помилка подачі заяви сервером.");
        }
    } catch (error) {
        alert("Помилка з’єднання.");
    }
  };

  const PortalHeader = (title: string, subtitle: string, initials: string) => (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 sm:p-2 rounded-xl">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 leading-tight">{title}</h1>
              <p className="text-[10px] sm:text-sm text-slate-500">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden md:block">
              <p className="font-medium text-sm text-slate-900">{studentInfo.name}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm sm:text-lg">
              {initials}
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  if (userRole === 'LECTURER' || userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-50">
        {PortalHeader("Панель Викладача", `Керування запитами`, "ВК")}
        <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <LecturerView handleLogout={handleLogout} userRole={userRole} userId={userId} /> 
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {PortalHeader("Особистий кабінет", "Студентський портал", "ІІ")}
      
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg shadow-blue-100">
                        ІІ
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{studentInfo.name}</h2>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500">
                            <span className="flex items-center"><User className="w-3.5 h-3.5 mr-1" /> {studentInfo.studentId}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{studentInfo.group}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{studentInfo.course}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setShowNewApplicationModal(true)} className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-md">
                    <Plus className="w-5 h-5 mr-2" /> Нова заява
                </button>
            </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {[
        { 
            label: 'Активні', 
            value: activeCount, 
            icon: Clock, 
            color: 'text-blue-600' 
        },
        { 
            label: 'Затверджено', 
            value: approvedCount, 
            icon: CheckCircle, 
            color: 'text-green-600' 
        },
        { 
            label: 'Всього', 
            value: totalCount, 
            icon: FileText, 
            color: 'text-slate-600' 
        }
    ].map((stat, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex items-center justify-between shadow-sm">
            <div>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
            </div>
            <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color} opacity-20`} />
        </div>
    ))}
</div>

        {/* LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-white">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Мої заяви</h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {loading ? (
                    <div className="py-12 text-center text-blue-500 flex flex-col items-center gap-2">
                        <Loader className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Завантаження даних...</span>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> {error}
                    </div>
                ) : applications.length === 0 ? (
                    <div className="py-16 text-center text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-10" />
                        <p className="text-sm">Список порожній. Подайте свою першу заяву.</p>
                    </div>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className={`border rounded-2xl p-4 sm:p-5 transition hover:border-blue-300 ${getStatusColor(app.status)}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 shrink-0">{getStatusIcon(app.status)}</div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">{app.type}</h3>
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Calendar className="w-3.5 h-3.5 mr-1" /> {new Date(app.date).toLocaleDateString('uk-UA')}
                                        </div>
                                        {app.comment && (
                                            <div className="mt-3 text-xs sm:text-sm text-slate-700 bg-white/60 p-3 rounded-lg border border-white/40 italic">
                                                "{app.comment}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end w-full md:w-auto justify-between gap-3">
                                    <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-white/80 border border-current">
                                        {getStatusText(app.status)}
                                    </span>
                                    <div className="flex gap-2">
                                        {['pending', 'нова'].includes(app.status) && (
                                            <>
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Редагувати"><Edit3 className="w-4 h-4" /></button>
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Видалити"><Trash2 className="w-4 h-4" /></button>
                                            </>
                                        )}
                                        {app.status === 'approved' && (
                                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Завантажити"><Download className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </main>

      {/* MODAL */}
      {showNewApplicationModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-white">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Нова заява</h3>
              <p className="text-xs sm:text-sm text-slate-500">Заповніть форму та підтвердіть подачу</p>
            </div>
            
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 bg-white">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Тип заяви</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {applicationTypes.map((type, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedType(type)}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-xs sm:text-sm transition-all ${
                        selectedType === type 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' 
                          : 'border-slate-100 hover:border-slate-200 text-slate-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">2. Опис заяви</label>
                <textarea
                  rows={4}
                  value={newApplicationDescription}
                  onChange={(e) => setNewApplicationDescription(e.target.value)}
                  placeholder="Опишіть ваше прохання детально..."
                  className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${isConfirmedToSign ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isConfirmedToSign}
                    onChange={(e) => setIsConfirmedToSign(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Підписати та подати</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                      Підтверджую достовірність даних. Ця дія прирівнюється до власноручного підпису.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3">
              <button onClick={() => { setShowNewApplicationModal(false); setIsConfirmedToSign(false); }} className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-700">
                Скасувати
              </button>
              <button
                onClick={addApplication}
                disabled={!selectedType || newApplicationDescription.trim() === '' || !isConfirmedToSign}
                className="flex-[2] px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-40 disabled:shadow-none transition-all active:scale-95"
              >
                Надіслати заяву
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;