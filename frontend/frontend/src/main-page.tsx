import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, 
  Calendar, LogOut, Loader, 
  Edit3, Trash2, Shield, Bell, Zap, Upload,
  Home, Archive, Edit
} from 'lucide-react';

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
  status: 'pending' | 'approved' | 'rejected' | 'in-review' | 'нова' | 'draft';
  comment?: string;
  rejectionReason?: string;
}

// --- VIEW ДЛЯ ВИКЛАДАЧА (без змін в логіці) ---
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
                    setApplications(data.map((app: any) => ({
                        id: app.applicationId,
                        type: app.applicationType?.typeName || 'Незн. тип',
                        date: app.createdDate.split('T')[0],
                        status: app.applicationStatus?.statusName?.toLowerCase() || 'pending',
                        studentName: app.student?.fullName || app.student?.username, 
                        comment: app.content, 
                    })));
                }
            } catch (err) { setError('Помилка мережі'); } finally { setLoading(false); }
        };
        fetchAllApplications();
    }, [userRole, userId]);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-700"><h2 className="text-xl font-bold">Заяви на розгляді</h2></div>
            <div className="p-6">
                {loading ? <Loader className="animate-spin mx-auto" /> : 
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                            <p className="font-bold">{app.type} (ID: {app.id})</p>
                            <p className="text-sm text-slate-400">Студент: {app.studentName}</p>
                        </div>
                    ))}
                </div>}
            </div>
        </div>
    );
};

// --- ГОЛОВНИЙ ПОРТАЛ СТУДЕНТА ---
const StudentPortal: React.FC<StudentPortalProps> = ({ handleLogout, userRole, userId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drafts' | 'active' | 'archive'>('overview');
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [newApplicationDescription, setNewApplicationDescription] = useState('');
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmedToSign, setIsConfirmedToSign] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingAppId, setEditingAppId] = useState<number | null>(null);
const [showNotifications, setShowNotifications] = useState(false);

const [notifications, setNotifications] = useState(1);
const [notificationList, setNotificationList] = useState([
  {
    id: 1,
    title: "Вітаємо в системі!",
    text: "Ви успішно авторизувались в ISUSA. Тепер ви можете створювати та підписувати заяви онлайн.",
    time: "Щойно",
    isNew: true
  }
]);

  const studentInfo = {
    name: 'Іванов Іван Петрович',
    group: 'КН-301',
    course: '3 курс',
    faculty: 'Факультет комп\'ютерних наук',
    studentId: 'ST2022001247'
  };

  const applicationTypes = Object.keys(APPLICATION_TYPE_MAP);

  // Категоризація заявок для вкладок
  const drafts = applications.filter(a => a.status === 'draft');
  const activeApps = applications.filter(a => ['pending', 'in-review', 'нова'].includes(a.status));
  const archivedApps = applications.filter(a => ['approved', 'rejected'].includes(a.status));

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    inProgress: activeApps.length
  };

  useEffect(() => {
    if (userId) setProfileImageUrl(`${API_BASE_URL}/profile-image/${userId}?t=${Date.now()}`);
  }, [userId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('authToken');
    setIsUploading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/profile-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (response.ok) setProfileImageUrl(`${API_BASE_URL}/profile-image/${userId}?t=${Date.now()}`);
    } catch (e) { alert('Помилка завантаження'); } finally { setIsUploading(false); }
  };

  useEffect(() => {
    const fetchMyApplications = async () => {
        if (userRole !== 'STUDENT') return; 
        const token = localStorage.getItem('authToken');
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/my`, { 
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json(); 
                setApplications(data.map((app: any) => ({
                    id: app.applicationId,
                    type: app.applicationType?.typeName || app.title || "Заява",
                    date: app.createdDate.split('T')[0],
                    status: app.applicationStatus?.statusName?.toLowerCase() === 'чернетка' ? 'draft' : 
                            app.applicationStatus?.statusName?.toLowerCase() === 'нова' ? 'нова' : 
                            app.applicationStatus?.statusName?.toLowerCase() || 'pending',
                    comment: app.content, 
                })));
            }
        } catch (err) { setError('Помилка завантаження'); } finally { setLoading(false); }
    };
    fetchMyApplications();
  }, [userRole, userId]);

  const handleAction = async () => {
    if (!selectedType || newApplicationDescription.trim() === '') return alert("Заповніть поля");
    const typeId = APPLICATION_TYPE_MAP[selectedType];
    const token = localStorage.getItem('authToken');
    let url = `${API_BASE_URL}/draft`, method = 'POST';
    let body: any = { typeId, title: selectedType, content: newApplicationDescription };

    if (editingAppId) {
        if (isConfirmedToSign) {
            url = `${API_BASE_URL}/${editingAppId}/sign`;
            body = { password: "USER_CONFIRMED" }; 
        } else {
            url = `${API_BASE_URL}/${editingAppId}`;
            method = 'PUT';
        }
    } else if (isConfirmedToSign) {
        url = `${API_BASE_URL}/sign-submit`;
        body.password = "USER_CONFIRMED";
    }

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (response.ok) {
            const result = await response.json();
            const updatedApp: MyApplication = { 
                id: result.applicationId, 
                type: result.applicationType?.typeName || selectedType,
                date: new Date().toISOString().split('T')[0],
                status: result.applicationStatus?.statusName?.toLowerCase() === 'чернетка' ? 'draft' : 
                        isConfirmedToSign ? 'нова' : 'draft',
                comment: result.content
            };
            if (editingAppId) setApplications(prev => prev.map(a => a.id === editingAppId ? updatedApp : a));
            else setApplications(prev => [updatedApp, ...prev]);
            closeModal();
        }
    } catch (e) { alert("Помилка запиту"); }
  };

  const closeModal = () => {
    setShowNewApplicationModal(false);
    setEditingAppId(null);
    setSelectedType('');
    setNewApplicationDescription('');
    setIsConfirmedToSign(false);
  };

  const deleteDraft = async (id: number) => {
    if (!window.confirm("Видалити чернетку?")) return;
    const token = localStorage.getItem('authToken');
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) setApplications(prev => prev.filter(a => a.id !== id));
    } catch (e) { alert("Помилка"); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'draft': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  if (userRole === 'LECTURER' || userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <header className="border-b border-slate-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2"><BookOpen className="text-blue-500" /> <span className="font-bold">ISUSA ADMIN</span></div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut /></button>
        </header>
        <main className="max-w-7xl mx-auto p-8"><LecturerView handleLogout={handleLogout} userRole={userRole} userId={userId} /></main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-10 h-10">
                    <BookOpen className="absolute inset-0 w-6 h-6 m-auto text-blue-500" strokeWidth={1.5} />
                    <Shield className="absolute inset-0 w-10 h-10 text-emerald-500 opacity-30" strokeWidth={1} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">ISUSA</span>
            </Link>

            <div className="flex items-center gap-4">
                <div className="relative"> 
                    {/* 1. Кнопка дзвіночка */}
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-lg transition-colors ${showNotifications ? 'bg-slate-800' : 'hover:bg-slate-800'}`}
                    >
                        <Bell className="w-5 h-5 text-slate-300" />
                        {notifications > 0 && (
                            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-slate-900">
                                {notifications}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            <div 
                                className="fixed inset-0 z-40 cursor-default" 
                                onClick={() => setShowNotifications(false)}
                            ></div>
                            
                            <div className="absolute right-0 mt-3 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                {/* Заголовок вікна */}
                                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                                    <h3 className="font-bold text-sm text-white">Сповіщення</h3>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNotificationList([]);
                                            setNotifications(0);
                                        }} 
                                        className="text-[10px] text-blue-400 hover:text-blue-300 uppercase font-bold"
                                    >
                                        Очистити все
                                    </button>
                                </div>

                                {/* Список сповіщень */}
                                <div className="max-h-96 overflow-y-auto bg-slate-800">
                                    {notificationList.length > 0 ? (
                                        notificationList.map((notification) => (
                                            <div key={notification.id} className="p-4 border-b border-slate-700/50 bg-blue-500/5 hover:bg-slate-700/50 transition-colors cursor-pointer group">
                                                <div className="flex gap-3">
                                                    <div className="mt-1 w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                                                        <Zap size={14} className="text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white leading-relaxed">
                                                            <span className="font-bold text-blue-400">{notification.title}</span> {notification.text}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 mt-2">{notification.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Bell size={24} className="mx-auto text-slate-600 mb-2 opacity-20" />
                                            <p className="text-xs text-slate-500">У вас немає нових сповіщень</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Вийти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-24">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full overflow-hidden flex items-center justify-center border-4 border-slate-700">
                    {profileImageUrl ? <img src={profileImageUrl} className="w-full h-full object-cover" alt="Avatar" /> : <User className="w-16 h-16 text-white" />}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center border-4 border-slate-800 cursor-pointer transition-colors">
                    {isUploading ? <Loader className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4 text-white" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
              </div>

              <div className="text-center mb-6 pb-6 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white mb-1">{studentInfo.name}</h2>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{studentInfo.faculty}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Група:</span><span className="text-white">{studentInfo.group}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Курс:</span><span className="text-white">{studentInfo.course}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-400">Студ. ID:</span><span className="text-slate-500 font-mono">#{studentInfo.studentId.slice(-4)}</span></div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { l: 'Всього', v: stats.total, i: FileText, c: 'text-blue-500' },
                { l: 'Схвалено', v: stats.approved, i: CheckCircle, c: 'text-emerald-500' },
                { l: 'Відхилено', v: stats.rejected, i: XCircle, c: 'text-red-500' },
                { l: 'У роботі', v: stats.inProgress, i: Clock, c: 'text-blue-400' }
              ].map((s, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <s.i className={`w-8 h-8 ${s.c} opacity-80`} />
                    <div><div className="text-2xl font-bold">{s.v}</div><div className="text-[10px] uppercase text-slate-500 font-bold">{s.l}</div></div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { setEditingAppId(null); setShowNewApplicationModal(true); }} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-3 transition-all font-bold border border-emerald-700 shadow-lg">
              <Plus className="w-6 h-6" /> <span className="text-lg">Створити нову заяву</span>
            </button>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-800">
              {[
                { id: 'overview', label: 'Огляд', icon: Home },
                { id: 'drafts', label: `Чернетки (${drafts.length})`, icon: Edit3 },
                { id: 'active', label: `Активні (${activeApps.length})`, icon: Clock },
                { id: 'archive', label: `Архів (${archivedApps.length})`, icon: Archive }
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`pb-4 px-2 text-sm flex items-center gap-2 transition-all border-b-2 ${activeTab === t.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {loading ? <div className="py-20 text-center"><Loader className="animate-spin mx-auto text-blue-500" /></div> : 
                 (activeTab === 'overview' ? applications : 
                  activeTab === 'drafts' ? drafts : 
                  activeTab === 'active' ? activeApps : archivedApps).map(app => (
                    <div key={app.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex justify-between items-center hover:border-slate-500 transition-colors">
                        <div>
                            <h4 className="font-bold text-slate-200">{app.type}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {app.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                {app.status === 'draft' ? 'Чернетка' : app.status === 'approved' ? 'Схвалено' : app.status === 'rejected' ? 'Відхилено' : 'У роботі'}
                            </span>
                            {app.status === 'draft' && (
                                <div className="flex gap-1">
                                    <button onClick={() => { setEditingAppId(app.id); setSelectedType(app.type); setNewApplicationDescription(app.comment || ''); setShowNewApplicationModal(true); }} className="p-2 text-blue-400 hover:bg-slate-700 rounded-lg"><Edit size={16} /></button>
                                    <button onClick={() => deleteDraft(app.id)} className="p-2 text-red-400 hover:bg-slate-700 rounded-lg"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">© 2026 ISUSA. Побудовано для безпечного управління документами.</p>
        </div>
      </footer>

      {/* Modal - Збережено твою верстку та логіку */}
      {showNewApplicationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 font-bold text-xl">{editingAppId ? 'Редагування' : 'Нова заява'}</div>
            <div className="p-6 space-y-4">
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500">
                <option value="">Виберіть тип...</option>
                {applicationTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea value={newApplicationDescription} onChange={e => setNewApplicationDescription(e.target.value)} rows={4} className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500" placeholder="Опис заяви..." />
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl cursor-pointer border border-slate-700">
                <input type="checkbox" checked={isConfirmedToSign} onChange={e => setIsConfirmedToSign(e.target.checked)} className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600" />
                <span className="text-sm font-bold">Підписати цифровим підписом</span>
              </label>
            </div>
            <div className="p-6 bg-slate-900/50 flex gap-3">
              <button onClick={closeModal} className="flex-1 py-3 text-slate-400 font-bold hover:text-white transition-colors">Скасувати</button>
              <button onClick={handleAction} className={`flex-[2] py-3 rounded-xl text-white font-bold transition-all ${isConfirmedToSign ? 'bg-blue-600 hover:bg-blue-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                {isConfirmedToSign ? 'Надіслати' : 'Зберегти як чернетку'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;