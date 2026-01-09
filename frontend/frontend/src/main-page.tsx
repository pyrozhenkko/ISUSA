import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, 
  Calendar, LogOut, Loader, 
  Edit3, Trash2, Shield, Bell, Zap, Upload,
  Home, Archive, Edit, ArrowRight, MessageSquare
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

const SecureImage: React.FC<{ src: string, alt: string, className?: string }> = ({ src, alt, className }) => {
    const [imageBlob, setImageBlob] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(src, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    setImageBlob(objectUrl);
                } else {
                    console.error(`Помилка завантаження: ${response.status}`);
                }
            } catch (e) {
                console.error("Мережева помилка", e);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
        return () => { if (imageBlob) URL.revokeObjectURL(imageBlob); };
    }, [src]);

    if (loading) return <div className="h-48 flex items-center justify-center bg-slate-900/50 rounded-xl"><Loader className="animate-spin text-blue-500" /></div>;
    
    if (!imageBlob) return (
        <div className="h-48 flex flex-col items-center justify-center bg-slate-900/50 text-slate-500 gap-2">
            <XCircle size={24} />
            <span className="text-xs">Доступ заборонено (403) або файл відсутній</span>
        </div>
    );

    return (
        <img 
            src={imageBlob} 
            alt={alt} 
            className={className} 
            onClick={() => window.open(imageBlob, '_blank')}
        />
    );
};

const LecturerView: React.FC<StudentPortalProps> = ({ userRole, onViewDetail }) => {
    const [applications, setApplications] = useState<MyApplication[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
const [filterFaculty, setFilterFaculty] = useState('');
const [filterYear, setFilterYear] = useState('');
    
    const [hoveredStudentData, setHoveredStudentData] = useState<any | null>(null);
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
                
                const officialApplications = data.filter((app: any) => {
                    const statusName = app.applicationStatus?.statusName?.toLowerCase() || '';
                    return !statusName.includes('чернетка') && !statusName.includes('draft');
                });

                setApplications(officialApplications.map((app: any) => {
                    const user = app.student?.userResponseDto;
                    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Невідомо';
                    
                    console.log(`App ID: ${app.applicationId}, Status ID: ${app.applicationStatus?.statusId}, Name: ${app.applicationStatus?.statusName}`);

                    return {
                        id: app.applicationId,
                        type: app.applicationType?.typeName || 'Заява',
                        date: new Date(app.createdDate).toLocaleString('uk-UA'),
                        status: app.applicationStatus?.statusName || 'На розгляді', 
                        
                        studentName: fullName,
                        studentFullInfo: app.student 
                    };
                }));
            }
        } catch (err) { 
            console.error('Помилка завантаження'); 
        } finally { 
            setLoading(false); 
        }
    };
    fetchAll();
}, [userRole]);
    
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
                const statusNames: { [key: number]: string } = { 5: 'Схвалено', 6: 'Відхилено' };
                setApplications(prev => prev.map(app => 
                    app.id === appId ? { ...app, status: statusNames[statusId] || app.status } : app
                ));
            }
        } catch (err) { alert("Помилка при оновленні"); }
    };

    const filteredApplications = applications.filter(app => {
    const matchesSearch = app.studentName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === '' || app.type === filterType;
    const matchesFaculty = filterFaculty === '' || (app as any).studentFullInfo?.userResponseDto?.faculty === filterFaculty;
    const matchesYear = filterYear === '' || (app as any).studentFullInfo?.yearOfStudy?.toString() === filterYear;

    return matchesSearch && matchesType && matchesFaculty && matchesYear;
});

    const allTypes = Array.from(new Set(applications.map(a => a.type)));
    const allFaculties = Array.from(new Set(applications.map(a => (a as any).studentFullInfo?.userResponseDto?.faculty).filter(Boolean)));

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
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6">
                    {/* Верхній ряд: Заголовок + Пошук */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-bold flex items-center gap-3 shrink-0">
                            <Shield className="text-blue-500" /> Панель Деканату
                        </h2>
                        
                        <div className="relative w-full md:w-96">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Пошук за ПІБ студента..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500"
                            />
                        </div>
                    </div>

                    {/* Блок фільтрів: Винесений окремим рядком */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Тип заяви</label>
                            <select 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                            >
                                <option value="">Всі типи заяв</option>
                                {allTypes.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Факультет</label>
                            <select 
                                value={filterFaculty} 
                                onChange={(e) => setFilterFaculty(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors cursor-pointer appearance-none"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                            >
                                <option value="">Всі факультети</option>
                                {allFaculties.map(f => <option key={f as string} value={f as string} className="bg-slate-900">{f as string}</option>)}
                            </select>
                        </div>
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
                        {filteredApplications.map(app => (
                            <div 
                                key={app.id} 
                                onClick={() => onViewDetail && onViewDetail(app.id)}
                                className="p-4 bg-slate-900/50 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all group flex items-center justify-between cursor-pointer"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                                            {app.type}
                                        </p>
                                        <span className="text-[10px] text-slate-600 font-mono">ID: {app.id}</span>
                                    </div>
                                    
                                    <p 
                                        className="text-sm text-blue-400 font-medium cursor-help relative inline-block underline decoration-blue-500/30 underline-offset-4"
                                        onMouseEnter={() => setHoveredStudentData((app as any).studentFullInfo)}
                                        onMouseLeave={() => setHoveredStudentData(null)}
                                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        Студент: {app.studentName}
                                    </p>
                                    
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Calendar size={10}/> {app.date}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(app.status)}`}>
                                        {app.status}
                                    </span>
                                    
                                    <div className="flex gap-1 border-l border-slate-700 pl-3 ml-1">    
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); 
                                                onViewDetail && onViewDetail(app.id);
                                            }}
                                            className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                            title="Деталі"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </div>

            {/* ПРЕВ'Ю СТУДЕНТА */}
            {hoveredStudentData && (
                <div 
                    className="fixed z-[200] w-72 bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in duration-200 pointer-events-none"
                    style={{ 
                        left: `${mousePos.x + 15}px`, 
                        top: `${mousePos.y + 15}px` 
                    }}
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-slate-900 rounded-full border-2 border-blue-500/30 overflow-hidden flex-shrink-0">
                                {/* Додаємо перевірку на наявність об'єкта userResponseDto */}
                                {hoveredStudentData?.userResponseDto?.userId ? (
                                    <SecureImage 
                                        src={`${API_PROFILE_URL}/profile-image/${hoveredStudentData.userResponseDto.userId}`} 
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>
                                                        <div>
                                {/* ТУТ ПІДТЯГУЄМО ІМ'Я ТА ПРІЗВИЩЕ */}
                                <h4 className="font-bold text-white leading-tight">
                                    {hoveredStudentData.userResponseDto?.firstName || '—'} {hoveredStudentData.userResponseDto?.lastName || ''}
                                </h4>
                                {/* ТУТ ФАКУЛЬТЕТ */}
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">
                                    {hoveredStudentData.userResponseDto?.faculty || "Факультет не вказано"}
                                </p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-700 pt-3">
                            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                                <p className="text-[8px] text-slate-500 uppercase font-bold">Група</p>
                                <p className="text-xs text-blue-400 font-bold">{hoveredStudentData.groupId || "—"}</p>
                            </div>
                            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                                <p className="text-[8px] text-slate-500 uppercase font-bold">Спеціальність</p>
                                <p className="text-[10px] text-emerald-400 font-bold leading-tight">{hoveredStudentData.specialty || "—"}</p>
                            </div>
                        </div>
                    </div>
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
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [filePreview, setFilePreview] = useState<string | null>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
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
        const response = await fetch(`${API_BASE_URL}/${viewingApplication.applicationId}/status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                statusId: viewingApplication.applicationStatus.statusId, 
                comment: newComment 
            })
        });

        const updatedData = await response.json();
        console.log("Отримано після додавання коментаря:", updatedData);

        if (response.ok) {
            setViewingApplication(updatedData); 
            setNewComment('');
        }
    } catch (e) { 
        alert("Помилка при додаванні"); 
    } finally { 
        setIsSendingComment(false); 
    }
};

const handleViewDetails = async (id: number) => {
    const token = localStorage.getItem('authToken');
    setVerificationResult(null);
    
    try {
        setIsLoadingDetails(true);
        const isStaff = userRole === 'DEANERY_STAFF' || userRole === 'ADMIN';
        
        const url = isStaff 
            ? `http://localhost:8081/api/applications/${id}`  // Шлях для деканату
            : `http://localhost:8081/api/applications/my/${id}`; // Шлях для студента

        console.log(`Запит деталей. Роль: ${userRole}, URL: ${url}`);

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Дані заявки успішно отримано:", data);
            setViewingApplication(data);
            setShowViewModal(true);
        } else {
            const errorText = await response.text();
            console.error("Помилка завантаження деталей:", response.status, errorText);
            alert(`Помилка ${response.status}: У вас немає доступу до цієї заяви або вона не існує.`);
        }
    } catch (e) {
        console.error("Мережева помилка:", e);
        alert("Помилка з'єднання з сервером.");
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

                    if (rawStatus.includes('чернетка')) {
                        mappedStatus = 'draft';
                    } 
                    else if (rawStatus.includes('нова')) {
                        mappedStatus = 'нова';
                    } 
                    else if (rawStatus.includes('схвалено') || rawStatus.includes('approved')) {
                        mappedStatus = 'approved';
                    } 
                    else if (rawStatus.includes('відхилено') || rawStatus.includes('rejected') || rawStatus.includes('скасовано')) {
                        mappedStatus = 'rejected';
                    } 
                    else if (rawStatus.includes('в обробці') || rawStatus.includes('розгляд')) {
                        mappedStatus = 'in-review';
                    }

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
    
    // Базові дані заявки
    const applicationData: any = {
        typeId,
        title: selectedType,
        content: newApplicationDescription
    };

    try {
        let response;
        let url = `${API_BASE_URL}/draft`;
        let method = 'POST';

        // 1. ВИЗНАЧАЄМО URL ТА МЕТОД
        if (editingAppId) {
            if (isConfirmedToSign) {
                url = `${API_BASE_URL}/${editingAppId}/sign`;
                applicationData.password = signPassword;
            } else {
                url = `${API_BASE_URL}/${editingAppId}`;
                method = 'PUT';
            }
        } else if (isConfirmedToSign) {
            url = `${API_BASE_URL}/full-submit`;
            applicationData.password = signPassword;
        }

        // 2. ЛОГІКА ВІДПРАВКИ (FormData vs JSON)
        if (isConfirmedToSign) {
            // Використовуємо FormData для подачі (може бути файл)
            const formData = new FormData();
            formData.append('data', new Blob([JSON.stringify(applicationData)], {
                type: 'application/json'
            }));

            if (selectedFile) {
                formData.append('file', selectedFile); 
            }

            response = await fetch(url, {
                method: 'POST', // Підпис та full-submit зазвичай POST
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData, 
            });
        } else {
            // Використовуємо чистий JSON для чернеток
            response = await fetch(url, {
                method,
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(applicationData),
            });
        }

        // 3. ОБРОБКА ВІДПОВІДІ
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
            
            setSelectedFile(null);
            setFilePreview(null);
            closeModal();
        } else {
            const errorText = await response.text();
            alert(`Помилка сервера: ${errorText}`);
        }
    } catch (e) { 
        console.error("Fetch error:", e);
        alert("Помилка запиту"); 
    }
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

const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    
    // Зелений: Схвалено / Approved
    if (s.includes('схвалено') || s.includes('approved')) {
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
    
    // Червоний: Відхилено / Rejected / Скасовано
    if (s.includes('відхилено') || s.includes('rejected') || s.includes('скасовано')) {
        return 'text-red-500 bg-red-500/10 border-red-500/20';
    }
    
    // Синій: Нова заява / Потребує уваги
    if (s.includes('нова') || s.includes('потребує') || s.includes('new')) {
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
    
    // Помаранчевий (за замовчуванням): На розгляді / In Review
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
};

if (userRole === 'DEANERY_STAFF' || userRole === 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <BookOpen className="text-blue-500" /> 
                <span className="font-bold tracking-tight">ISUSA ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    Персонал: {userData?.firstName} {userData?.lastName}
                </span>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </div>
        </header>

        {/* Основний контент (Список) */}
        <main className="max-w-7xl mx-auto p-8">
            <LecturerView 
                handleLogout={handleLogout} 
                userRole={userRole} 
                userId={userId} 
                userData={userData}
                onViewDetail={handleViewDetails}
            />
        </main>

        {/* МОДАЛЬНЕ ВІКНО ПЕРЕГЛЯДУ (Вставлено сюди) */}
        {showViewModal && viewingApplication && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
                <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
                    
                    {/* Заголовок модалки */}
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {viewingApplication.applicationType?.typeName || viewingApplication.title || "Перегляд заяви"}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono">ID: {viewingApplication.applicationId}</p>
                        </div>
                        <button onClick={() => closeModal()} className="text-slate-400 hover:text-white p-2">
                            <XCircle size={24} />
                        </button>
                    </div>
                    
                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        
                        {/* 1. ІНФОРМАЦІЯ ПРО СТУДЕНТА */}
                        <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl shadow-inner">
                            <div className="w-14 h-14 bg-slate-900 rounded-full border-2 border-blue-500/30 overflow-hidden flex-shrink-0">
                                {viewingApplication.student?.userResponseDto?.userId ? (
                                    <SecureImage 
                                        src={`${API_PROFILE_URL}/profile-image/${viewingApplication.student.userResponseDto.userId}`} 
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest mb-0.5">Заявник</p>
                                <h4 className="text-white font-bold text-lg leading-none">
                                    {viewingApplication.student?.userResponseDto 
                                        ? `${viewingApplication.student.userResponseDto.firstName} ${viewingApplication.student.userResponseDto.lastName}` 
                                        : `Студент (ID: ${viewingApplication.student?.studentId})`}
                                </h4>
                                <p className="text-xs text-slate-400 mt-1">
                                    Група: <span className="text-slate-200">{viewingApplication.student?.groupId || '—'}</span> • 
                                    Факультет: <span className="text-slate-200">
                                        {viewingApplication.student?.faculty || viewingApplication.student?.userResponseDto?.faculty || '—'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* 2. СТАТУС ТА ДАТА */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Поточний статус</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(viewingApplication.applicationStatus?.statusName || 'pending')}`}>
                                    {viewingApplication.applicationStatus?.statusName}
                                </span>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Подано</p>
                                <p className="text-sm text-slate-200 flex items-center justify-end gap-2">
                                    <Clock size={14} className="text-blue-500" />
                                    {new Date(viewingApplication.createdDate).toLocaleString('uk-UA')}
                                </p>
                            </div>
                        </div>

                        {/* 3. ЗМІСТ ЗАЯВИ */}
                        <div className="space-y-2 bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5 text-slate-100"><FileText size={40}/></div>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Текст звернення</p>
                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap relative z-10">
                                {viewingApplication.content}
                            </p>
                        </div>

                        {/* 4. ВКЛАДЕНІ ФАЙЛИ */}
                        {viewingApplication.attachments && viewingApplication.attachments.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Прикріплені докази</p>
                                <div className="grid grid-cols-1 gap-4">
                                    {viewingApplication.attachments.map((file: any) => (
                                        <div key={file.attachmentId} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900 shadow-lg group">
                                            <SecureImage 
                                                src={`http://localhost:8081/api/attachments/download/${file.attachmentId}`} 
                                                alt={file.fileName}
                                                className="w-full h-auto max-h-96 object-contain cursor-zoom-in hover:opacity-90 transition-opacity"
                                            />
                                            <div className="p-3 bg-slate-800/80 text-[11px] text-slate-300 flex justify-between items-center border-t border-slate-700">
                                                <span className="font-medium truncate pr-4">{file.fileName}</span>
                                                <span className="text-slate-500 font-mono text-[9px] shrink-0">
                                                    {new Date(file.uploadedDate).toLocaleDateString('uk-UA')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 5. БЛОК КОМЕНТАРІВ */}
                        <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare size={18} className="text-blue-500" />
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Обговорення та зауваження</h3>
                            </div>

                            <div className="space-y-4">
                                {viewingApplication.comments && viewingApplication.comments.length > 0 ? (
                                    [...viewingApplication.comments]
                                        .sort((a: any, b: any) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()).map((c: any) => {
                                            const isStudent = c.author?.roleName === 'STUDENT'; 
                                            return (
                                                <div key={c.commentId} className={`p-4 rounded-2xl border ${
                                                    isStudent ? 'bg-slate-900/40 ml-10' : 'bg-blue-600/10 mr-10 shadow-lg'
                                                }`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black uppercase text-blue-400">
                                                            {c.author?.firstName} {c.author?.lastName} {!isStudent && '(Деканат)'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-600">
                                                            {new Date(c.createdDate).toLocaleString('uk-UA')}
                                                        </span>
                                                    </div>
                                                    {/* ВАЖЛИВО: Поле має називатися commentText, як у твоєму DTO */}
                                                    <p className="text-sm text-slate-200">{c.commentText}</p>
                                                </div>
                                            );
                                        })
                                ) : (
                                    <div className="text-center py-6 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                                        <p className="text-xs text-slate-600 italic">Коментарів до цієї заяви ще не залишено</p>
                                    </div>
                                )}
                            </div>

                            {/* Поле додавання коментаря */}
                            <div className="mt-6 flex gap-2 animate-in slide-in-from-bottom-2">
                                <input 
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Написати повідомлення студенту..."
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-600"
                                />
                                <button 
                                    onClick={handleAddComment}
                                    disabled={isSendingComment || !newComment.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white px-5 rounded-xl transition-all flex items-center justify-center shadow-lg"
                                >
                                    {isSendingComment ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ПАНЕЛЬ ДІЙ (Схвалити / Відхилити) */}
                    <div className="p-6 bg-slate-900/80 border-t border-slate-700 flex flex-wrap gap-3 justify-between items-center">
                        <div className="flex gap-2">
                            <button 
                                onClick={async () => {
                                    if(window.confirm("Ви впевнені, що хочете СХВАЛИТИ цю заяву?")) {
                                        const token = localStorage.getItem('authToken');
                                        try {
                                            const response = await fetch(`http://localhost:8081/api/applications/${viewingApplication.applicationId}/status`, {
                                                method: 'PUT',
                                                headers: { 
                                                    'Authorization': `Bearer ${token}`, 
                                                    'Content-Type': 'application/json' 
                                                },
                                                body: JSON.stringify({ statusId: 5, comment: "Заяву схвалено деканатом" }),
                                            });

                                            if (response.ok) {
                                                alert("Заявку успішно схвалено!");
                                                closeModal();
                                                window.location.reload();
                                            } else {
                                                const err = await response.text();
                                                alert("Помилка при оновленні: " + err);
                                            }
                                        } catch (e) {
                                            alert("Помилка мережі");
                                        }
                                    }
                                }}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2"
                            >
                                <CheckCircle size={16} /> Схвалити
                            </button>
                            <button 
                                onClick={() => {
                                    const reason = prompt("Вкажіть причину відхилення:");
                                    if (reason) {
                                        const token = localStorage.getItem('authToken');
                                        fetch(`http://localhost:8081/api/applications/${viewingApplication.applicationId}/status`, {
                                            method: 'PUT',
                                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ statusId: 6, comment: reason }),
                                        }).then(() => { closeModal(); window.location.reload(); });
                                    }
                                }}
                                className="px-6 py-2.5 bg-red-600/20 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white rounded-xl transition-all font-bold text-sm flex items-center gap-2"
                            >
                                <XCircle size={16} /> Відхилити
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => closeModal()}
                            className="px-8 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-bold text-sm"
                        >
                            Закрити
                        </button>
                    </div>
                </div>
            </div>
        )}
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
            <div className="flex gap-4 border-b border-slate-800 overflow-x-auto no-scrollbar">
                {[
                { id: 'overview', label: 'Огляд', icon: Home },
                { id: 'drafts', label: `Чернетки (${drafts.length})`, icon: Edit3 },
                { id: 'active', label: `Активні (${activeApps.length})`, icon: Clock },
                { id: 'archive', label: `Архів (${archivedApps.length})`, icon: Archive }
                ].map(t => (
                <button 
                    key={t.id} 
                    onClick={() => setActiveTab(t.id as any)} 
                    className={`pb-4 px-2 text-sm flex items-center gap-2 transition-all border-b-2 whitespace-nowrap flex-shrink-0 ${
                        activeTab === t.id 
                            ? 'border-blue-500 text-blue-500' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
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
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(app.status)}`}>
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
                            if(!e.target.checked) {
                                setSignPassword('');
                                setSelectedFile(null); 
                                setFilePreview(null);
                            }
                        }} 
                        className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-blue-600" 
                    />
                    <span className="text-sm font-bold">Підписати цифровим підписом та подати</span>
                </label>

                {isConfirmedToSign && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input 
                            type="password" 
                            value={signPassword} 
                            onChange={e => setSignPassword(e.target.value)}
                            className="w-full p-3 bg-slate-900 border border-blue-500/30 rounded-xl text-white outline-none focus:border-blue-500" 
                            placeholder="Введіть пароль для підпису" 
                        />

                        <div className="space-y-2">
                            <p className="text-[10px] uppercase font-bold text-slate-500 ml-1">Прикріпити докази/фото (необов'язково)</p>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-900/30 overflow-hidden">
                                {filePreview ? (
                                    <img src={filePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                        <span className="text-xs text-slate-500">Завантажити фото</span>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
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
            {/* Заголовок модалки */}
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div>
                    <h2 className="text-xl font-bold text-white">
                        {viewingApplication.applicationType?.typeName || viewingApplication.title || "Перегляд заяви"}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">ID: {viewingApplication.applicationId}</p>
                </div>
                <button onClick={() => closeModal()} className="text-slate-400 hover:text-white p-2 transition-colors">
                    <XCircle size={24} />
                </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                
                {/* ІНФОРМАЦІЯ ПРО СТУДЕНТА (Завжди показуємо для деканату) */}
                <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                    <div className="w-12 h-12 bg-slate-900 rounded-full border border-blue-500/30 overflow-hidden flex-shrink-0">
                        {viewingApplication.student?.userResponseDto?.userId ? (
                            <SecureImage 
                                src={`${API_PROFILE_URL}/profile-image/${viewingApplication.student.userResponseDto.userId}`} 
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                <User size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Заявник</p>
                        <h4 className="text-white font-bold">
                            {viewingApplication.student?.userResponseDto 
                                ? `${viewingApplication.student.userResponseDto.firstName} ${viewingApplication.student.userResponseDto.lastName}` 
                                : `Студент (ID: ${viewingApplication.student?.studentId || 'Невідомо'})`}
                        </h4>
                        <p className="text-xs text-slate-400">
                            Група: <span className="text-slate-200">{viewingApplication.student?.groupId || '—'}</span> • 
                            Спеціальність: <span className="text-slate-200">{viewingApplication.student?.specialty || '—'}</span>
                        </p>
                    </div>
                </div>

                {/* Статус та Дата */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Статус</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyles(viewingApplication.applicationStatus?.statusName || 'pending')}`}>
                            {viewingApplication.applicationStatus?.statusName || 'Розглядається'}
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

                {/* Зміст заяви */}
                <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Зміст заяви</p>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {viewingApplication.content}
                    </p>
                </div>

                {/* ВКЛАДЕНІ ФАЙЛИ */}
                {viewingApplication.attachments && viewingApplication.attachments.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Прикріплені документи</p>
                        <div className="grid grid-cols-1 gap-4">
                            {viewingApplication.attachments.map((file: any) => (
                                <div key={file.attachmentId} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900 shadow-lg">
                                    <SecureImage 
                                        src={`http://localhost:8081/api/attachments/download/${file.attachmentId}`} 
                                        alt={file.fileName}
                                        className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                    <div className="p-2 bg-slate-800/50 text-[10px] text-slate-400 flex justify-between items-center">
                                        <span className="truncate pr-2">{file.fileName}</span>
                                        <span className="shrink-0">{new Date(file.uploadedDate).toLocaleDateString('uk-UA')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* БЛОК КОМЕНТАРІВ */}
                <div className="mt-8 pt-6 border-t border-slate-700/50 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare size={18} className="text-blue-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Історія обговорення</h3>
                    </div>

                    <div className="space-y-4">
                        {viewingApplication.comments && viewingApplication.comments.length > 0 ? (
                                    [...viewingApplication.comments]
                                        .sort((a: any, b: any) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()).map((c: any) => {
                                            const isStudent = c.author?.roleName === 'STUDENT'; 
                                            return (
                                                <div key={c.commentId} className={`p-4 rounded-2xl border ${
                                                    isStudent ? 'bg-slate-900/40 ml-10' : 'bg-blue-600/10 mr-10 shadow-lg'
                                                }`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] font-black uppercase text-blue-400">
                                                            {c.author?.firstName} {c.author?.lastName} {!isStudent && '(Деканат)'}
                                                        </span>
                                                        <span className="text-[9px] text-slate-600">
                                                            {new Date(c.createdDate).toLocaleString('uk-UA')}
                                                        </span>
                                                    </div>
                                                    {/* ВАЖЛИВО: Поле має називатися commentText, як у твоєму DTO */}
                                                    <p className="text-sm text-slate-200">{c.commentText}</p>
                                                </div>
                                            );
                                        })
                                ) : (
                            <div className="text-center py-8 bg-slate-900/20 rounded-2xl border border-dashed border-slate-700">
                                <p className="text-xs text-slate-600 italic">Коментарів до цієї заяви ще не залишено</p>
                            </div>
                        )}
                    </div>

                    {/* Поле додавання коментаря для Деканату */}
                    {((userRole as string) === 'DEANERY_STAFF' || (userRole as string) === 'ADMIN') && (
                        <div className="mt-6 flex gap-2 animate-in slide-in-from-bottom-2">
                            <input 
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Додати офіційне зауваження..."
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-all text-white"
                            />
                            <button 
                                onClick={handleAddComment}
                                disabled={isSendingComment || !newComment.trim()}
                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-blue-900/20"
                            >
                                {isSendingComment ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Нижня панель кнопок */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                <button 
                    onClick={() => closeModal()}
                    className="px-8 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all font-bold text-sm shadow-inner"
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