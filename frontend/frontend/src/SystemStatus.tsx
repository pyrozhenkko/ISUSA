import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Shield, 
  Bell, 
  LogOut, 
  User,
  Activity,
  CheckCircle,
  Clock,
  Server,
  Database,
  Wifi,
  Lock,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Footer from './Footer';

export default function SystemStatus() {
  const currentStatus = 'operational'; // operational, degraded, outage

  const services = [
    {
      name: 'Web Application',
      description: 'Основний веб-інтерфейс',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '124ms',
      icon: Wifi
    },
    {
      name: 'API Services',
      description: 'REST API endpoints',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '89ms',
      icon: Zap
    },
    {
      name: 'Database',
      description: 'PostgreSQL primary cluster',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '12ms',
      icon: Database
    },
    {
      name: 'Authentication',
      description: 'Сервіс автентифікації',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '156ms',
      icon: Lock
    },
    {
      name: 'Document Signing',
      description: 'RSA підпис документів',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '234ms',
      icon: Shield
    },
    {
      name: 'File Storage',
      description: 'Сховище файлів',
      status: 'operational',
      uptime: '99.94%',
      responseTime: '178ms',
      icon: Server
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'Планове технічне обслуговування',
      status: 'completed',
      severity: 'maintenance',
      date: '2026-01-01',
      duration: '30 хв',
      description: 'Оновлення серверної інфраструктури успішно завершено'
    },
    {
      id: 2,
      title: 'Короткочасне уповільнення API',
      status: 'resolved',
      severity: 'minor',
      date: '2025-12-28',
      duration: '15 хв',
      description: 'Тимчасове підвищення навантаження, вирішено масштабуванням'
    },
    {
      id: 3,
      title: 'Оновлення системи безпеки',
      status: 'completed',
      severity: 'maintenance',
      date: '2025-12-20',
      duration: '1 год',
      description: 'Впровадження покращених алгоритмів шифрування'
    }
  ];

  const metrics = [
    { label: 'Загальний Uptime', value: '99.97%', trend: 'up', change: '+0.02%' },
    { label: 'Середній час відповіді', value: '132ms', trend: 'down', change: '-8ms' },
    { label: 'Активних користувачів', value: '2,847', trend: 'up', change: '+12%' },
    { label: 'Успішних запитів', value: '99.8%', trend: 'up', change: '+0.1%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return {
          bg: 'bg-emerald-600/10',
          border: 'border-emerald-600/20',
          text: 'text-emerald-500',
          dot: 'bg-emerald-500'
        };
      case 'degraded':
        return {
          bg: 'bg-yellow-600/10',
          border: 'border-yellow-600/20',
          text: 'text-yellow-500',
          dot: 'bg-yellow-500'
        };
      case 'outage':
        return {
          bg: 'bg-red-600/10',
          border: 'border-red-600/20',
          text: 'text-red-500',
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-slate-600/10',
          border: 'border-slate-600/20',
          text: 'text-slate-500',
          dot: 'bg-slate-500'
        };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Працює нормально';
      case 'degraded':
        return 'Уповільнена робота';
      case 'outage':
        return 'Недоступний';
      default:
        return 'Невідомо';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600/10 border-red-600/20 text-red-500';
      case 'major':
        return 'bg-orange-600/10 border-orange-600/20 text-orange-500';
      case 'minor':
        return 'bg-yellow-600/10 border-yellow-600/20 text-yellow-500';
      case 'maintenance':
        return 'bg-blue-600/10 border-blue-600/20 text-blue-500';
      default:
        return 'bg-slate-600/10 border-slate-600/20 text-slate-500';
    }
  };

  const mainStatusColor = getStatusColor(currentStatus);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <BookOpen className="absolute inset-0 w-6 h-6 m-auto text-blue-500" strokeWidth={1.5} />
                                <Shield className="absolute inset-0 w-10 h-10 text-emerald-500 opacity-30" strokeWidth={1} />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">ISUSA</span>
                        </Link>
                        <span className="text-slate-600">/</span>
              <span className="text-sm text-slate-400">Status</span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                Головна
              </a>
              <button className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors">
                <User className="w-4 h-4 text-slate-300" />
              </button>
              <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Current Status Banner */}
      <section className={`border-b border-slate-800 ${mainStatusColor.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-4">
            <div className={`p-3 ${mainStatusColor.bg} border ${mainStatusColor.border} rounded-full`}>
              <Activity className={`w-8 h-8 ${mainStatusColor.text}`} />
            </div>
            <div className="text-center">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-block w-3 h-3 rounded-full ${mainStatusColor.dot} animate-pulse`}></span>
                <h1 className="text-3xl text-white">Всі системи працюють нормально</h1>
              </div>
              <p className="text-slate-400">Останнє оновлення: 03 січня 2026, 14:23 UTC</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Key Metrics */}
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-6">Ключові метрики</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">{metric.label}</span>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="text-2xl text-white mb-1">{metric.value}</div>
                <div className={`text-xs ${metric.trend === 'up' ? 'text-emerald-500' : 'text-blue-500'}`}>
                  {metric.change} за 24 год
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services Status */}
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-6">Статус сервісів</h2>
          <div className="space-y-3">
            {services.map((service, index) => {
              const statusColor = getStatusColor(service.status);
              return (
                <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-slate-700 border border-slate-600 rounded-lg">
                        <service.icon className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white mb-1">{service.name}</h3>
                        <p className="text-sm text-slate-400">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Uptime</div>
                        <div className="text-white">{service.uptime}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500">Відповідь</div>
                        <div className="text-white">{service.responseTime}</div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 ${statusColor.bg} border ${statusColor.border} rounded-lg`}>
                        <span className={`w-2 h-2 rounded-full ${statusColor.dot}`}></span>
                        <span className={`text-sm ${statusColor.text}`}>
                          {getStatusText(service.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Uptime Chart Placeholder */}
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-6">Історія доступності (90 днів)</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="flex items-end justify-between h-48 gap-1">
              {Array.from({ length: 90 }).map((_, i) => {
                const height = 85 + Math.random() * 15;
                const isIncident = Math.random() > 0.95;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${
                      isIncident ? 'bg-red-500/50' : 'bg-emerald-500/50'
                    } hover:bg-blue-500`}
                    style={{ height: `${height}%` }}
                    title={`День ${i + 1}: ${height.toFixed(1)}%`}
                  ></div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <span>90 днів тому</span>
              <span>Сьогодні</span>
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section className="mb-16">
          <h2 className="text-2xl text-white mb-6">Історія інцидентів</h2>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white">{incident.title}</h3>
                      <span className={`px-2 py-1 text-xs border rounded ${getSeverityColor(incident.severity)}`}>
                        {incident.severity === 'maintenance' ? 'Обслуговування' : 
                         incident.severity === 'minor' ? 'Незначний' : 
                         incident.severity === 'major' ? 'Значний' : 'Критичний'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {incident.date}
                      </span>
                      <span>Тривалість: {incident.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 border border-emerald-600/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-500">Вирішено</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Subscribe to Updates */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
