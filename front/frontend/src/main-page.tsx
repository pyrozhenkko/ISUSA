import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Plus, User, BookOpen, Calendar, MessageSquare, Download, Eye } from 'lucide-react';

interface MyApplication {
  id: number;
  type: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
  comment?: string;
}

const StudentPortal = () => {
  const [showNewApplicationModal, setShowNewApplicationModal] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const studentInfo = {
    name: 'Іванов Іван Петрович',
    group: 'КН-301',
    course: '3 курс',
    faculty: 'Факультет комп\'ютерних наук',
    studentId: 'ST2022001247'
  };

  const myApplications: MyApplication[] = [
    { 
      id: 1, 
      type: 'Довідка про навчання', 
      date: '2025-11-10', 
      status: 'in-review',
      comment: 'Заяву прийнято в обробку'
    },
    { 
      id: 2, 
      type: 'Академічна відпустка', 
      date: '2025-11-05', 
      status: 'pending',
      comment: 'Очікує розгляду деканатом'
    },
    { 
      id: 3, 
      type: 'Довідка про навчання', 
      date: '2025-10-28', 
      status: 'approved',
      comment: 'Довідка готова до видачі в деканаті'
    },
    { 
      id: 4, 
      type: 'Перенесення сесії', 
      date: '2025-10-15', 
      status: 'rejected',
      comment: 'Недостатньо підстав для перенесення'
    },
  ];

  const applicationTypes = [
    'Довідка про навчання',
    'Академічна відпустка',
    'Переведення на бюджет',
    'Перенесення сесії',
    'Відрахування за власним бажанням',
    'Поновлення на навчання',
    'Довідка-виклик',
    'Матеріальна допомога'
  ];

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'in-review': return <Eye className="w-5 h-5 text-yellow-500" />;
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Очікує розгляду',
      'in-review': 'В обробці',
      approved: 'Затверджено',
      rejected: 'Відхилено'
    };
    return statusMap[status as keyof typeof statusMap];
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: 'border-blue-200 bg-blue-50',
      'in-review': 'border-yellow-200 bg-yellow-50',
      approved: 'border-green-200 bg-green-50',
      rejected: 'border-red-200 bg-red-50'
    };
    return colorMap[status as keyof typeof colorMap];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Особистий кабінет</h1>
                <p className="text-sm text-slate-500">Студентський портал</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right mr-3">
                <p className="font-medium text-slate-900">{studentInfo.name}</p>
                <p className="text-sm text-slate-500">{studentInfo.group}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                ІІ
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Info Card */}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{myApplications.filter(a => a.status === 'pending' || a.status === 'in-review').length}</p>
                <p className="text-sm text-slate-600">Активні заяви</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{myApplications.filter(a => a.status === 'approved').length}</p>
                <p className="text-sm text-slate-600">Затверджено</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-600">{myApplications.length}</p>
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

          <div className="p-6 space-y-4">
            {myApplications.map((app) => (
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
        </div>
      </main>

      {/* New Application Modal */}
      {showNewApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Нова заява</h3>
            <p className="text-sm text-slate-600 mb-6">Оберіть тип заяви, яку ви хочете подати</p>
            
            <div className="space-y-3 mb-6">
              {applicationTypes.map((type, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedType(type)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                    selectedType === type 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowNewApplicationModal(false);
                  setSelectedType('');
                }}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
              >
                Скасувати
              </button>
              <button
                disabled={!selectedType}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Подати заяву
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;