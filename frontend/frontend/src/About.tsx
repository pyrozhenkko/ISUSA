import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Shield, 
  Bell, 
  LogOut, 
  User,
  Target,
  Users,
  Zap,
  Lock,
  FileCheck,
  TrendingUp,
  Award,
  Github,
  ExternalLink
} from 'lucide-react';
import Footer from './Footer';

import NazarPhoto from './assets/Nazar.jpg';
import IvanPhoto from './assets/Ivan.jpg';
import VetalPhoto from './assets/Vetal.jpg';

export default function About() {
  const features = [
    {
      icon: FileCheck,
      title: 'Управління заявами',
      description: 'Повний цикл роботи з документами: від створення чернетки до отримання результату.'
    },
    {
      icon: Lock,
      title: 'Цифровий підпис',
      description: 'RSA-2048 шифрування для безпечного підписання та відправки документів.'
    },
    {
      icon: TrendingUp,
      title: 'Відстеження статусу',
      description: 'Моніторинг прогресу заяв у реальному часі з детальною історією змін.'
    },
    {
      icon: Users,
      title: 'Роль-орієнтований доступ',
      description: 'Різні рівні доступу для студентів, викладачів та адміністрації.'
    }
  ];

  const timeline = [
    { year: '2025', title: 'Початок проєкту', description: 'Аналіз потреб та проектування архітектури системи' },
    { year: '2025', title: 'Розробка MVP', description: 'Створення базового функціоналу та тестування з пілотною групою' },
    { year: '2026', title: 'Впровадження', description: 'Запуск системи для всіх факультетів університету' },
    { year: '2026+', title: 'Розширення', description: 'Додавання нових модулів та інтеграцій' }
  ];

  const team = [
    { role: 'Team Lead + Backend Developer', name: 'Пироженко Назар Олександрович', photo: NazarPhoto },
    { role: 'Backend Developer', name: 'Руденко Віталій', photo: VetalPhoto },
    { role: 'Frontend Developer', name: 'Іван', photo: IvanPhoto },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <BookOpen className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 m-auto text-blue-500" strokeWidth={1.5} />
                  <Shield className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 opacity-30" strokeWidth={1} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ISUSA</span>
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs sm:text-sm text-slate-400">About</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <a href="/" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors">
                Головна
              </a>
              <button className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center hover:bg-slate-600 transition-colors">
                <User className="w-4 h-4 text-slate-300" />
              </button>
              <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-300" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline text-sm text-slate-300">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-sm text-blue-400 mb-6">
              <Target className="w-4 h-4" />
              Про проєкт
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-white tracking-tight font-bold">
              Про <span className="text-blue-500">ISUSA</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 leading-relaxed">
              Інформаційна система управління студентськими заявами - сучасне рішення для автоматизації документообігу в університеті.
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Mission Section */}
        <section className="mb-12 sm:mb-20">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 md:p-12">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              <div className="p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl shrink-0">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl text-white font-bold mb-4">Наша місія</h2>
                <div className="space-y-4 text-sm sm:text-base text-slate-400 leading-relaxed">
                  <p>
                    ISUSA створена для спрощення та прискорення процесу подання, обробки та відстеження студентських заяв. 
                    Ми прагнемо зробити взаємодію між студентами та адміністрацією максимально прозорою, ефективною та безпечною.
                  </p>
                  <p>
                    Наша мета - повністю оцифрувати документообіг, зберігаючи при цьому юридичну значущість документів 
                    та високий рівень захисту персональних даних.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl text-white mb-8 text-center font-bold">Ключові можливості</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 hover:border-slate-600 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg shrink-0">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl text-white mb-8 text-center font-bold">Історія розвитку</h2>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-700 hidden md:block"></div>
            <div className="space-y-6 sm:space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                  <div className="hidden md:flex w-16 h-16 bg-blue-600 border-4 border-slate-900 rounded-full items-center justify-center flex-shrink-0 relative z-10">
                    <span className="text-xs font-bold">{item.year}</span>
                  </div>
                  <div className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6">
                    <div className="md:hidden text-xs font-bold text-blue-500 mb-2">{item.year}</div>
                    <h3 className="text-lg sm:text-xl text-white font-semibold mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl text-white mb-8 text-center font-bold">Технологічний стек</h2>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-base sm:text-lg text-white font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Frontend
                </h3>
                <ul className="space-y-3">
                  {['React + TypeScript', 'Tailwind CSS', 'Vite'].map((tech) => (
                    <li key={tech} className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg text-white font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-500" />
                  Backend
                </h3>
                <ul className="space-y-3">
                  {['Java Spring', 'PostgreSQL', 'Redis Cache'].map((tech) => (
                    <li key={tech} className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="sm:col-span-2 md:col-span-1">
                <h3 className="text-base sm:text-lg text-white font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-500" />
                  Security
                </h3>
                <ul className="space-y-3">
                  {['RSA-2048 Encryption', 'JWT Authentication', 'SSL/TLS'].map((tech) => (
                    <li key={tech} className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-10 text-center">Команда</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-colors group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 relative">
                  <div className="w-full h-full bg-slate-700 rounded-full overflow-hidden border-2 border-slate-600 ring-4 ring-blue-600/10 shadow-xl group-hover:ring-blue-600/20 transition-all">
                    {member.photo ? (
                      <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">{member.role}</div>
                <div className="text-base sm:text-lg font-medium text-slate-200">{member.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Section */}
        <section>
          <div className="bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border border-blue-600/20 rounded-2xl p-6 sm:p-8 md:p-12 text-center">
            <Github className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl text-white font-bold mb-4">Open Source проєкт</h2>
            <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-2xl mx-auto">
              ISUSA - це проєкт з відкритим вихідним кодом. Ми віримо у прозорість та спільну розробку. 
              Долучайтесь до розвитку системи на GitHub!
            </p>
            <a 
              href="https://github.com/pyrozhenkko/ISUSA" 
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-sm font-medium"
            >
              <Github className="w-5 h-5" />
              <span>Переглянути на GitHub</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}