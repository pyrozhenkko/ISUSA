import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, 
  Calendar, LogOut, Loader, 
  Edit3, Trash2, Shield, Bell, Zap, Upload,
  Home, Archive, Edit, ArrowRight
} from 'lucide-react';
import Footer from './Footer';

type UserRole = 'STUDENT' | 'DEANERY_STAFF' | 'ADMIN';
const API_BASE_URL = 'http://localhost:8081/api/applications'; 
const API_PROFILE_URL = 'http://localhost:8081/api/attachments'

const APPLICATION_TYPE_MAP: { [key: string]: number  } = {
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
    userData: any;
    onViewDetail?: (id: number) => void;
}

interface MyApplication {
  id: number;
  userid: number;
  studentName?: string;
  type: string;
  date: string;
  status: string;
  comment?: string;
  rejectionReason?: string;
  studentId?: number;
}

const LecturerView: React.FC<StudentPortalProps> = ({ userRole, onViewDetail }) => {
    const [applications, setApplications] = useState<MyApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredStudentId, setHoveredStudentId] = useState<number | null>(null);
const [studentPreview, setStudentPreview] = useState<any | null>(null);
const [isLoadingPreview, setIsLoadingPreview] = useState(false);
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchAll = async () => {
            if (userRole !== 'DEANERY_STAFF' && userRole !== 'ADMIN') return;
            const token = localStorage.getItem('authToken');
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8081/api/applications`, { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                    const data = await response.json(); 
                    setApplications(data.map((app: any) => ({
                        id: app.applicationId,
                        type: app.applicationType?.typeName || 'Заява',
                        studentId: app.student?.userId,
                        date: new Date(app.createdDate).toLocaleString('uk-UA'),
                        status: app.applicationStatus?.statusName || 'На розгляді',
                        studentName: app.student ? `${app.student.firstName} ${app.student.lastName}` : 'Невідомо',
                        comment: app.content, 
                    })));
                }
            } catch (err) { console.error('Помилка завантаження'); } finally { setLoading(false); }
        };
        fetchAll();
    }, [userRole]);

    useEffect(() => {
    if (!hoveredStudentId) {
        setStudentPreview(null);
        return;
    }

    const fetchPreview = async () => {
        const token = localStorage.getItem('authToken');
        setIsLoadingPreview(true);
        try {
            const response = await fetch(`http://localhost:8081/api/applications/student/${hoveredStudentId}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStudentPreview(data);
            }
        } catch (e) {
            console.error("Помилка завантаження прев'ю");
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const timer = setTimeout(fetchPreview, 400);
    return () => clearTimeout(timer);
}, [hoveredStudentId]);

    const handleUpdateStatus = async (appId: number, statusId: number, comment: string = "") => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await fetch(`http://localhost:8081/api/applications/${appId}/status`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ statusId, comment }),
            });

            if (response.ok) {
                const statusNames: { [key: number]: string } = { 3: 'Схвалено', 4: 'Відхилено' };
                setApplications(prev => prev.map(app => 
                    app.id === appId ? { ...app, status: statusNames[statusId] || app.status } : app
                ));
            }
        } catch (err) { alert("Помилка при оновленні"); }
    };

    const filteredApplications = applications.filter(app => 
        app.studentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('схвалено')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        if (s.includes('відхилено') || s.includes('скасовано')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (s.includes('потребує')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    };

    return (
        <div className="space-y-6">
            {/* Панель пошуку */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <Shield className="text-blue-500" /> Панель Деканату
                    </h2>
                    <div className="relative w-full md:w-96">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input 
                            type="text"
                            placeholder="Пошук за ПІБ студента..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-blue-500 outline-none transition-all text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Усі запити ({filteredApplications.length})
                    </span>
                </div>
                
                <div className="p-4">
                    {loading ? <div className="py-10 text-center"><Loader className="animate-spin mx-auto text-blue-500" /></div> : 
                    <div className="grid gap-3">
                        {filteredApplications.length > 0 ? filteredApplications.map(app => (
                            <div key={app.id} className="p-4 bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-200">{app.type}</p>
                                        <span className="text-[10px] text-slate-600 font-mono">ID: {app.id}</span>
                                    </div>
                                    <p 
                                      className="text-sm text-blue-400 font-medium cursor-help relative inline-block underline decoration-blue-500/30 underline-offset-4"
                                      onMouseEnter={() => setHoveredStudentId(app.studentId || null)}
                                      onMouseLeave={() => setHoveredStudentId(null)}
                                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                                  >
                                      Студент: {app.studentName}
                                  </p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar size={10}/> {app.date}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                        {app.status}
                                    </span>
                                    
                                    {/* КНОПКИ ДІЙ ДЛЯ ДЕКАНАТУ */}
                                    <div className="flex gap-1 border-l border-slate-700 pl-3 ml-1">
                                        <button 
                                            onClick={() => handleUpdateStatus(app.id, 3, "Схвалено")}
                                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                            title="Схвалити"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const reason = prompt("Вкажіть причину відхилення:");
                                                if (reason) handleUpdateStatus(app.id, 4, reason);
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Відхилити"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onViewDetail && onViewDetail(app.id)}
                                            className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                            title="Деталі"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500">Заявок не знайдено</div>
                        )}
                    </div>}

                </div>
            </div>
            {hoveredStudentId && (
    <div 
        className="fixed z-[200] w-72 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200 pointer-events-none"
        style={{ 
            left: `${mousePos.x + 15}px`, 
            top: `${mousePos.y + 15}px` 
        }}
    >
        {isLoadingPreview ? (
            <div className="flex justify-center p-4"><Loader className="animate-spin text-blue-500" /></div>
        ) : studentPreview ? (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-full border-2 border-blue-500/30 overflow-hidden flex-shrink-0">
                        <img 
                            src={`${API_PROFILE_URL}/profile-image/${hoveredStudentId}?t=${Date.now()}`} 
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + studentPreview.firstName)}
                        />
                    </div>
                    <div>
                        <h4 className="font-bold text-white leading-tight">
                            {studentPreview.firstName} {studentPreview.lastName}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">
                            {studentPreview.faculty || "Факультет не вказано"}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 border-t border-slate-700 pt-3">
                    <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Група</p>
                        <p className="text-xs text-blue-400 font-bold">{studentPreview.student?.groupName || "—"}</p>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                        <p className="text-[8px] text-slate-500 uppercase font-bold">Курс</p>
                        <p className="text-xs text-emerald-400 font-bold">{studentPreview.student?.yearOfStudy || "—"}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Zap size={10} className="text-amber-500" />
                    <span>Деталі</span>
                </div>
            </div>
        ) : (
            <p className="text-xs text-slate-500 text-center">Завантаження профілю...</p>
        )}
    </div>
)}
        </div>
    );
};

const StudentPortal: React.FC<StudentPortalProps> = ({ handleLogout, userRole, userId, userData }) => {
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
const [signPassword, setSignPassword] = useState('');
const [viewingApplication, setViewingApplication] = useState<any | null>(null);
const [isLoadingDetails, setIsLoadingDetails] = useState(false);
const [showViewModal, setShowViewModal] = useState(false);
const [verificationResult, setVerificationResult] = useState<{valid: boolean, message: string} | null>(null);
const [isVerifying, setIsVerifying] = useState(false);
const [newComment, setNewComment] = useState('');
const [isSendingComment, setIsSendingComment] = useState(false);

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

  const applicationTypes = Object.keys(APPLICATION_TYPE_MAP);
  
  const handleVerifySignature = async (appId: number) => {
    const token = localStorage.getItem('authToken');
    setIsVerifying(true);
    try {
        const response = await fetch(`http://localhost:8081/api/applications/${appId}/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setVerificationResult({ valid: data.isValid, message: data.message });
    } catch (e) {
        alert("Помилка при перевірці підпису");
    } finally {
        setIsVerifying(false);
    }
};

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
    if (userId) setProfileImageUrl(`${API_PROFILE_URL}/profile-image/${userId}?t=${Date.now()}`);
  }, [userId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);  
    const token = localStorage.getItem('authToken');
    setIsUploading(true);
    try {
        const response = await fetch(`${API_PROFILE_URL}/profile-image`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        if (response.ok) setProfileImageUrl(`${API_PROFILE_URL}/profile-image/${userId}?t=${Date.now()}`);
        else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Upload error:", errorData);
          alert(`Помилка завантаження: ${response.status}`);
        }
    } catch (e) { alert('Помилка завантаження'); } finally { setIsUploading(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const token = localStorage.getItem('authToken');
    setIsSendingComment(true);
    try {
        const response = await fetch(`http://localhost:8081/api/applications/${viewingApplication.applicationId}/comments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newComment })
        });
        if (response.ok) {
            const addedComment = await response.json();
            setViewingApplication({
                ...viewingApplication,
                comments: [...(viewingApplication.comments || []), addedComment]
            });
            setNewComment('');
        }
    } catch (e) { alert("Помилка при додаванні коментаря"); }
    finally { setIsSendingComment(false); }
};

  const handleViewDetails = async (id: number) => {
    const token = localStorage.getItem('authToken');
    setVerificationResult(null);
    try {
        setIsLoadingDetails(true);
        const response = await fetch(`${API_BASE_URL}/my/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            setViewingApplication(data);
            setShowViewModal(true);
        } else {
            alert("Не вдалося завантажити деталі заявки");
        }
    } catch (e) {
        alert("Помилка мережі");
    } finally {
        setIsLoadingDetails(false);
    }
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
                setApplications(data.map((app: any) => {
                    const rawStatus = app.applicationStatus?.statusName?.toLowerCase() || '';
                    
                    let mappedStatus: MyApplication['status'] = 'pending';
                    if (rawStatus.includes('чернетка')) mappedStatus = 'draft';
                    else if (rawStatus.includes('нова')) mappedStatus = 'нова';
                    else if (rawStatus.includes('в обробці') || rawStatus.includes('розгляд')) mappedStatus = 'in-review';
                    else if (rawStatus.includes('схвалено')) mappedStatus = 'approved';
                    else if (rawStatus.includes('відхилено')) mappedStatus = 'rejected';

                    return {
                        id: app.applicationId,
                        type: app.applicationType?.typeName || app.title || "Заява",
                        date: new Date(app.createdDate).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        status: mappedStatus,
                        comment: app.content, 
                    };
                }));
            }
        } catch (err) { 
            setError('Помилка завантаження'); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchMyApplications();
}, [userRole, userId]);

  const handleAction = async () => {
    if (!selectedType || newApplicationDescription.trim() === '') return alert("Заповніть поля");
    
    if (isConfirmedToSign && !signPassword) {
        return alert("Будь ласка, введіть пароль для підпису");
    }

    const typeId = APPLICATION_TYPE_MAP[selectedType];
    const token = localStorage.getItem('authToken');
    
    let url = `${API_BASE_URL}/draft`, method = 'POST';
    let body: any = { typeId, title: selectedType, content: newApplicationDescription };

    if (editingAppId) {
        if (isConfirmedToSign) {
            url = `${API_BASE_URL}/${editingAppId}/sign`;
            body = { password: signPassword };
        } else {
            url = `${API_BASE_URL}/${editingAppId}`;
            method = 'PUT';
        }
    } else if (isConfirmedToSign) {
        url = `${API_BASE_URL}/full-submit`;
        body = { 
            typeId, 
            title: selectedType, 
            content: newApplicationDescription, 
            password: signPassword 
        };
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
                userid: result.userid,
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
    setShowViewModal(false);
    setViewingApplication(null);
    setVerificationResult(null);
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
    const s = status.toLowerCase();
    if (s.includes('схвалено')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (s.includes('відхилено') || s.includes('скасовано')) return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (s.includes('потребує')) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; 
};

  if (userRole === 'DEANERY_STAFF' || userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <header className="border-b border-slate-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2"><BookOpen className="text-blue-500" /> <span className="font-bold">ISUSA ADMIN</span></div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut /></button>
        </header>
        <main className="max-w-7xl mx-auto p-8">
            <LecturerView 
                handleLogout={handleLogout} 
                userRole={userRole} 
                userId={userId} 
                userData={userData}
                onViewDetail={handleViewDetails}
            />
        </main>
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
                <span className="text-slate-600">/</span>
              <span className="text-sm text-slate-400">Account</span>
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
                  
                  <h2 className="text-lg font-bold text-white mb-1">
                    {userData?.firstName} {userData?.lastName}
                  </h2>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    {userData?.faculty || 'Факультет не вказано'}
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Кафедра:</span>
                    <span className="text-white text-right">{userData?.department || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-white text-xs">{userData?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ID Користувача:</span>
                    <span className="text-slate-500 font-mono">#{userId}</span>
                  </div>
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
                        <div 
                          className="cursor-pointer group flex-1" 
                          onClick={() => handleViewDetails(app.id)}
                      >
                          <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors flex items-center gap-2">
                              {app.type}
                              {isLoadingDetails && viewingApplication?.applicationId === app.id && <Loader size={14} className="animate-spin text-blue-500" />}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar size={12} /> {app.date}</p>
                      </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                  {app.status}
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
      <Footer />

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
                <input 
                  type="checkbox" 
                  checked={isConfirmedToSign} 
                  onChange={e => {
                      setIsConfirmedToSign(e.target.checked);
                      if(!e.target.checked) setSignPassword('');
                  }} 
                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600" 
                />
                <span className="text-sm font-bold">Підписати цифровим підписом</span>
              </label>

              {isConfirmedToSign && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input 
                    type="password" 
                    value={signPassword} 
                    onChange={e => setSignPassword(e.target.value)}
                    className="w-full p-3 bg-slate-900 border border-blue-500/30 rounded-xl text-white outline-none focus:border-blue-500 transition-all shadow-inner" 
                    placeholder="Введіть пароль акаунту для підтвердження" 
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-500 mt-1 ml-1 italic">
                    Це необхідно для генерації RSA-підпису документа
                  </p>
                </div>
              )}
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
      {showViewModal && viewingApplication && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div>
                    <h2 className="text-xl font-bold text-white">{viewingApplication.applicationType?.typeName || viewingApplication.title}</h2>
                    <p className="text-xs text-slate-500 font-mono">ID: {viewingApplication.applicationId}</p>
                </div>
                <button onClick={() => closeModal()} className="text-slate-400 hover:text-white p-2">
                    <XCircle size={24} />
                </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Статус</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(viewingApplication.applicationStatus?.statusName?.toLowerCase() === 'чернетка' ? 'draft' : 'pending')}`}>
                            {viewingApplication.applicationStatus?.statusName}
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Дата створення</p>
                        <p className="text-sm text-slate-200 flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" />
                            {new Date(viewingApplication.createdDate).toLocaleString('uk-UA')}
                        </p>
                    </div>
                </div>

                <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Зміст заяви</p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {viewingApplication.content}
                    </p>
                </div>

                {viewingApplication.signature && (
                    <div className={`p-4 rounded-2xl border ${
                        verificationResult 
                            ? (verificationResult.valid ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10') 
                            : 'border-slate-700 bg-slate-900/50'
                    }`}>
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Shield size={18} className={verificationResult?.valid ? "text-emerald-500" : "text-blue-500"} />
                                <span className="text-xs font-bold uppercase tracking-wider">Цифровий підпис (RSA-2048)</span>
                            </div>
                            
                            {/* КНОПКА ПЕРЕВІРКИ - ДОСТУПНА ТІЛЬКИ ДЛЯ ДЕКАНАТУ/АДМІНА */}
                            {((userRole as string) === 'DEANERY_STAFF' || (userRole as string) === 'ADMIN') && !verificationResult && (
                                <button 
                                    onClick={() => handleVerifySignature(viewingApplication.applicationId)}
                                    disabled={isVerifying}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                >
                                    {isVerifying ? <Loader size={12} className="animate-spin" /> : <Zap size={12} />}
                                    ПЕРЕВІРИТИ ЦІЛІСНІСТЬ
                                </button>
                            )}
                        </div>

                        {verificationResult ? (
                            <div className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2">
                                {verificationResult.valid ? (
                                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                ) : (
                                    <XCircle className="text-red-500 shrink-0" size={20} />
                                )}
                                <div>
                                    <p className={`text-sm font-bold ${verificationResult.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {verificationResult.valid ? "Документ верифіковано" : "Критична помилка цілісності"}
                                    </p>
                                    <p className="text-[10px] text-slate-400">{verificationResult.message}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[10px] text-slate-500 break-all font-mono opacity-50">
                                {viewingApplication.signature.substring(0, 100)}...
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* БЛОК КОМЕНТАРІВ */}
              <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                      <Edit3 size={18} className="text-blue-500" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Обговорення та зауваження</h3>
                  </div>

                  {/* Список існуючих коментарів */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {viewingApplication.comments && viewingApplication.comments.length > 0 ? (
                          viewingApplication.comments.map((c: any) => (
                              <div key={c.id} className={`p-3 rounded-2xl border ${c.authorRole === 'STUDENT' ? 'bg-slate-900/30 border-slate-800 ml-4' : 'bg-blue-600/5 border-blue-500/20 mr-4'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                      <span className={`text-[10px] font-bold uppercase ${c.authorRole === 'STUDENT' ? 'text-slate-500' : 'text-blue-400'}`}>
                                          {c.authorName} {c.authorRole === 'DEANERY_STAFF' && '(Деканат)'}
                                      </span>
                                      <span className="text-[9px] text-slate-600">{new Date(c.createdDate).toLocaleString('uk-UA')}</span>
                                  </div>
                                  <p className="text-sm text-slate-300 leading-relaxed">{c.text}</p>
                              </div>
                          ))
                      ) : (
                          <p className="text-center text-xs text-slate-600 py-4 italic">Коментарів поки немає</p>
                      )}
                  </div>

                  {/* Поле для нового коментаря (Тільки для Деканату/Адміна) */}
                  {((userRole as string) === 'DEANERY_STAFF' || (userRole as string) === 'ADMIN') && (
                      <div className="mt-4 flex gap-2">
                          <input 
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Напишіть зауваження або запитання..."
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                          />
                          <button 
                              onClick={handleAddComment}
                              disabled={isSendingComment || !newComment.trim()}
                              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-xl transition-all"
                          >
                              {isSendingComment ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                          </button>
                      </div>
                  )}
              </div>

            <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                <button 
                    onClick={() => closeModal()}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-bold text-sm"
                >
                    Закрити
                </button>
            </div>
        </div>
    </div>
)}
    </div>
  );
};

export default StudentPortal;