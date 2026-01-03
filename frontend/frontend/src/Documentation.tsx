import React, { useState } from 'react';
import { 
  BookOpen, 
  Shield, 
  Bell, 
  LogOut, 
  User,
  Book,
  Search,
  ChevronRight,
  FileText,
  Lock,
  Settings,
  HelpCircle,
  Rocket,
  Code,
  Download,
  Github,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Початок роботи',
      icon: Rocket,
      articles: [
        { id: 'intro', title: 'Вступ до ISUSA', time: '5 хв' },
        { id: 'registration', title: 'Реєстрація в системі', time: '3 хв' },
        { id: 'first-application', title: 'Перша заява', time: '10 хв' },
        { id: 'interface', title: 'Огляд інтерфейсу', time: '7 хв' }
      ]
    },
    {
      id: 'applications',
      title: 'Робота із заявами',
      icon: FileText,
      articles: [
        { id: 'create', title: 'Створення заяви', time: '8 хв' },
        { id: 'drafts', title: 'Чернетки та автозбереження', time: '5 хв' },
        { id: 'signing', title: 'Цифровий підпис документів', time: '12 хв' },
        { id: 'tracking', title: 'Відстеження статусу', time: '6 хв' },
        { id: 'templates', title: 'Шаблони заяв', time: '10 хв' }
      ]
    },
    {
      id: 'security',
      title: 'Безпека',
      icon: Lock,
      articles: [
        { id: 'authentication', title: 'Аутентифікація', time: '7 хв' },
        { id: 'rsa-signing', title: 'RSA-2048 підпис', time: '15 хв' },
        { id: 'data-protection', title: 'Захист даних', time: '10 хв' },
        { id: 'two-factor', title: 'Двофакторна автентифікація', time: '8 хв' }
      ]
    },
    {
      id: 'profile',
      title: 'Налаштування профілю',
      icon: Settings,
      articles: [
        { id: 'edit-profile', title: 'Редагування профілю', time: '5 хв' },
        { id: 'avatar', title: 'Завантаження аватара', time: '3 хв' },
        { id: 'notifications', title: 'Налаштування сповіщень', time: '6 хв' },
        { id: 'password', title: 'Зміна паролю', time: '4 хв' }
      ]
    },
    {
      id: 'api',
      title: 'API та інтеграції',
      icon: Code,
      articles: [
        { id: 'api-intro', title: 'Вступ до API', time: '10 хв' },
        { id: 'authentication-api', title: 'API аутентифікація', time: '12 хв' },
        { id: 'endpoints', title: 'Доступні endpoints', time: '20 хв' },
        { id: 'webhooks', title: 'Webhooks', time: '15 хв' }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      articles: [
        { id: 'common-issues', title: 'Поширені проблеми', time: '8 хв' },
        { id: 'troubleshooting', title: 'Усунення неполадок', time: '12 хв' },
        { id: 'contact-support', title: 'Зв\'язок з підтримкою', time: '3 хв' }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Швидкий старт', description: 'Розпочніть роботу за 5 хвилин', icon: Rocket, color: 'blue' },
    { title: 'API Reference', description: 'Повна документація API', icon: Code, color: 'emerald' },
    { title: 'Завантажити SDK', description: 'Бібліотеки для розробників', icon: Download, color: 'purple' },
    { title: 'GitHub', description: 'Вихідний код проєкту', icon: Github, color: 'slate' }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600/10 border-blue-600/20 text-blue-500',
      emerald: 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500',
      purple: 'bg-purple-600/10 border-purple-600/20 text-purple-500',
      slate: 'bg-slate-600/10 border-slate-600/20 text-slate-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <BookOpen className="absolute inset-0 w-6 h-6 m-auto text-blue-500" strokeWidth={1.5} />
                <Shield className="absolute inset-0 w-10 h-10 text-emerald-500 opacity-30" strokeWidth={1} />
              </div>
              <span className="text-xl tracking-tight">ISUSA</span>
              <span className="text-slate-600">/</span>
              <span className="text-sm text-slate-400">Docs</span>
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

      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-sm text-blue-400 mb-6">
              <Book className="w-4 h-4" />
              Документація
            </div>
            <h1 className="text-5xl mb-6 text-white tracking-tight">
              База <span className="text-blue-500">знань</span> ISUSA
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              Все, що потрібно знати для ефективної роботи з системою
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Шукати в документації..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href="#"
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors group"
              >
                <div className={`inline-flex p-3 border rounded-lg mb-4 ${getColorClasses(link.color)}`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <h3 className="text-white mb-2 group-hover:text-blue-500 transition-colors">
                  {link.title}
                </h3>
                <p className="text-sm text-slate-400">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-3">
            {sections.map((section) => (
              <div
                key={section.id}
                className={activeSection === section.id ? 'block' : 'hidden'}
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <section.icon className="w-8 h-8 text-blue-500" />
                    <h2 className="text-3xl text-white">{section.title}</h2>
                  </div>
                  <p className="text-slate-400">
                    {section.articles.length} статей у цьому розділі
                  </p>
                </div>

                <div className="space-y-3">
                  {section.articles.map((article) => (
                    <a
                      key={article.id}
                      href="#"
                      className="block bg-slate-800 border border-slate-700 rounded-lg p-5 hover:border-slate-600 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white mb-1 group-hover:text-blue-500 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Час читання: {article.time}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}

            {/* Help Box */}
            <div className="mt-12 bg-gradient-to-r from-blue-600/10 to-emerald-600/10 border border-blue-600/20 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl text-white mb-2">Не знайшли відповідь?</h3>
                  <p className="text-slate-400 mb-4">
                    Наша служба підтримки готова допомогти вам у будь-який час
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors border border-blue-700"
                    >
                      Зв'язатися з підтримкою
                    </a>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      GitHub Discussions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates Section */}
            <div className="mt-12">
              <h3 className="text-2xl text-white mb-6">Останні оновлення</h3>
              <div className="space-y-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-600/10 border border-emerald-600/20 rounded">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white">Версія 2.4.0</h4>
                        <span className="text-xs text-slate-500">03.01.2026</span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Додано підтримку нових типів заяв та покращено швидкість роботи системи
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-600/10 border border-blue-600/20 rounded">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white">Оновлення документації</h4>
                        <span className="text-xs text-slate-500">28.12.2025</span>
                      </div>
                      <p className="text-sm text-slate-400">
                        Розширено розділ про безпеку та додано приклади інтеграції API
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-sm mb-4 text-slate-300">Project</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                    About ISUSA
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub Repository
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                    System Status
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm mb-4 text-slate-300">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                    Security Standards
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm mb-4 text-slate-300">Contact</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                    University Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2">
                    Feedback Form
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600">
                © 2026 ISUSA. Built for secure student application management.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Shield className="w-4 h-4" />
                <span>Encrypted with RSA-2048</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
