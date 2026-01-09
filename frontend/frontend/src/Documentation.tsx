import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Shield,
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
  CheckCircle,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import Footer from './Footer';

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      id: 'getting-started',
      title: 'Початок роботи',
      icon: Rocket,
      articles: [
        { 
          id: 'intro', 
          title: 'Вступ до ISUSA', 
          time: '1 хв',
          content: 'ISUSA — це система управління студентськими заявами. Вона дозволяє подавати документи онлайн, відстежувати їх статус та отримувати рішення без відвідування деканату.' 
        },
        { 
          id: 'registration', 
          title: 'Реєстрація в системі', 
          time: '2 хв',
          content: 'Вхід здійснюється через корпоративну пошту університету. Ваші дані (група, курс) підтягуються автоматично з бази даних.' 
        },
        { 
          id: 'first-application', 
          title: 'Перша заява', 
          time: '2 хв',
          content: 'Натисніть "Нова заява", оберіть тип документа та заповніть поля. Система перевірить коректність даних перед відправкою.' 
        },
        { 
          id: 'interface', 
          title: 'Огляд інтерфейсу', 
          time: '1 хв',
          content: 'Основні розділи: "Мої заяви" (список поданих документів), "Чернетки" (незавершені заяви) та "Профіль" (налаштування).' 
        }
      ]
    },
    {
      id: 'applications',
      title: 'Робота із заявами',
      icon: FileText,
      articles: [
        { 
          id: 'create', 
          title: 'Створення заяви', 
          time: '3 хв',
          content: 'Оберіть потрібний тип заяви зі списку. Поля, позначені зірочкою, є обов’язковими. Ви можете додати коментар для деканату.' 
        },
        { 
          id: 'drafts', 
          title: 'Чернетки та автозбереження', 
          time: '2 хв',
          content: 'Якщо ви закриєте вікно створення, заява збережеться в чернетках. Ви можете повернутись до редагування в будь-який момент.' 
        },
        { 
          id: 'signing', 
          title: 'Цифровий підпис документів', 
          time: '2 хв',
          content: 'Для подачі заяви потрібно накласти цифровий підпис (RSA). Це гарантує, що документ подали саме ви і він не був змінений.' 
        },
        { 
          id: 'tracking', 
          title: 'Відстеження статусу', 
          time: '4 хв',
          content: 'Статуси: "Нова" -> "На розгляді" -> "Схвалено"/"Відхилено". Ви отримаєте сповіщення при зміні статусу.' 
        },
        { 
          id: 'templates', 
          title: 'Шаблони заяв', 
          time: '1 хв',
          content: 'Ви можете використовувати готові шаблони для найпопулярніших запитів (довідка про навчання, матеріальна допомога тощо).' 
        }
      ]
    },
    {
      id: 'security',
      title: 'Безпека',
      icon: Lock,
      articles: [
        { 
          id: 'authentication', 
          title: 'Аутентифікація', 
          time: '2 хв',
          content: 'Ми використовуємо безпечні токени доступу (JWT). Сесія автоматично завершується через 24 години бездіяльності.' 
        },
        { 
          id: 'rsa-signing', 
          title: 'RSA-2048 підпис', 
          time: '5 хв',
          content: 'Ваш приватний ключ зберігається тільки у вас. Сервер отримує лише підписаний хеш документа для перевірки автентичності.' 
        },
        { 
          id: 'data-protection', 
          title: 'Захист даних', 
          time: '3 хв',
          content: 'Всі дані передаються через захищене з\'єднання (HTTPS) та зберігаються в зашифрованому вигляді.' 
        },
        { 
          id: 'two-factor', 
          title: 'Двофакторна автентифікація', 
          time: '2 хв',
          content: 'Рекомендуємо увімкнути 2FA в налаштуваннях профілю для додаткового захисту акаунту.' 
        }
      ]
    },
    {
      id: 'profile',
      title: 'Налаштування профілю',
      icon: Settings,
      articles: [
        { 
          id: 'edit-profile', 
          title: 'Редагування профілю', 
          time: '5 хв',
          content: 'Ви можете змінити контактний email та завантажити нове фото. Академічні дані змінюються через звернення в деканат.' 
        },
        { 
          id: 'avatar', 
          title: 'Завантаження аватара', 
          time: '3 хв',
          content: 'Підтримуються формати JPG та PNG. Фото використовується для ідентифікації в системі.' 
        },
        { 
          id: 'notifications', 
          title: 'Налаштування сповіщень', 
          time: '2 хв',
          content: 'Виберіть, які сповіщення ви хочете отримувати (email, push) та для яких подій (зміна статусу, нові повідомлення).' 
        },
        { 
          id: 'password', 
          title: 'Зміна паролю', 
          time: '4 хв',
          content: 'Змінити пароль можна в налаштуваннях безпеки. Новий пароль має бути надійним (мінімум 8 символів).' 
        }
      ]
    },
    {
      id: 'api',
      title: 'API та інтеграції',
      icon: Code,
      articles: [
        { 
          id: 'api-intro', 
          title: 'Вступ до API', 
          time: '4 хв',
          content: 'ISUSA надає REST API для інтеграції. Документація доступна для розробників після отримання API ключа.' 
        },
        { 
          id: 'authentication-api', 
          title: 'API аутентифікація', 
          time: '1 хв',
          content: 'Використовування Bearer Token у заголовку Authorization для всіх запитів до захищених ресурсів.' 
        },
        { 
          id: 'endpoints', 
          title: 'Доступні endpoints', 
          time: '4 хв',
          content: 'Основні ресурси: /applications, /users, /sign. Детальний опис параметрів дивіться у Swagger UI.' 
        },
        { 
          id: 'webhooks', 
          title: 'Webhooks', 
          time: '5 хв',
          content: 'Налаштування вебхуків для отримання повідомлень про події системи в реальному часі.' 
        }
      ]
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: HelpCircle,
      articles: [
        { 
          id: 'common-issues', 
          title: 'Поширені проблеми', 
          time: '2 хв',
          content: 'Якщо сторінка не завантажується, спробуйте очистити кеш браузера або перевірити підключення до мережі.' 
        },
        { 
          id: 'troubleshooting', 
          title: 'Усунення неполадок', 
          time: '2 хв',
          content: 'При виникненні помилок зробіть скріншот та надішліть його в службу підтримки разом з описом проблеми.' 
        },
        { 
          id: 'contact-support', 
          title: 'Зв\'язок з підтримкою', 
          time: '3 хв',
          content: 'Зв\'язатися з нами можна через форму зворотного зв\'язку або написавши на support@isusa.edu.' 
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Швидкий старт', link: '/', description: 'Розпочніть роботу за 5 хвилин', icon: Rocket, color: 'blue' },
    { title: 'API Reference', link: 'https://restfulapi.net', description: 'Повна документація API', icon: Code, color: 'emerald' },
    { title: 'Завантажити SDK', link: 'https://learn.microsoft.com/uk-ua/windows/apps/windows-app-sdk/downloads', description: 'Бібліотеки для розробників', icon: Download, color: 'purple' },
    { title: 'GitHub', link: 'https://github.com/pyrozhenkko/ISUSA', description: 'Вихідний код проєкту', icon: Github, color: 'slate' }
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

  const toggleArticle = (id: string) => {
    setActiveArticle(activeArticle === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <BookOpen className="absolute inset-0 w-5 h-5 sm:w-6 sm:h-6 m-auto text-blue-500" strokeWidth={1.5} />
                  <Shield className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 opacity-30" strokeWidth={1} />
                </div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white">ISUSA</span>
              </Link>
              <span className="hidden xs:inline text-slate-600">/</span>
              <span className="hidden xs:inline text-sm text-slate-400">Docs</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/" className="hidden md:inline text-sm text-slate-400 hover:text-white transition-colors">
                Головна
              </Link>
              <button className="hidden sm:flex w-8 h-8 rounded-full bg-slate-700 border border-slate-600 items-center justify-center hover:bg-slate-600 transition-colors">
                <User className="w-4 h-4 text-slate-300" />
              </button>
              <button className="flex items-center gap-2 px-2 sm:px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors">
                <LogOut className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline text-sm text-slate-300">Sign Out</span>
              </button>
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full text-xs sm:text-sm text-blue-400 mb-4 sm:mb-6">
              <Book className="w-3 h-3 sm:w-4 h-4" />
              Документація
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-white tracking-tight font-bold">
              База <span className="text-blue-500">знань</span> ISUSA
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-6 sm:mb-8 px-4">
              Все, що потрібно знати для ефективної роботи з системою
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto px-4">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Шукати в документації..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-800 border border-slate-700 rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-xl"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-0">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.link}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 hover:border-slate-600 transition-colors group shadow-lg"
              >
                <div className={`inline-flex p-2.5 sm:p-3 border rounded-lg mb-3 sm:mb-4 ${getColorClasses(link.color)}`}>
                  <link.icon className="w-5 h-5 sm:w-6 h-6" />
                </div>
                <h3 className="text-white text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 group-hover:text-blue-500 transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{link.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Mobile Overlay for Navigation */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <aside className={`
            fixed lg:sticky top-[4.1rem] left-0 h-[calc(100vh-4.1rem)] lg:h-auto
            w-64 sm:w-72 lg:w-full bg-slate-900 lg:bg-transparent border-r lg:border-none border-slate-800
            z-50 lg:z-0 lg:col-span-1 p-4 lg:p-0 transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="lg:sticky lg:top-24">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-4 px-4 tracking-widest lg:block hidden">Розділи</p>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setActiveArticle(null);
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 font-medium'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <section.icon className="w-4 h-4 sm:w-5 h-5" />
                    <span className="text-xs sm:text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="lg:col-span-3 min-w-0">
            {sections.filter(s => s.id === activeSection).map((section) => (
              <div key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2 sm:mb-3">
                    <section.icon className="w-6 h-6 sm:w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{section.title}</h2>
                  </div>
                  <p className="text-sm sm:text-base text-slate-500">
                    {section.articles.length} статей у цьому розділі
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {section.articles.map((article) => (
                    <div 
                      key={article.id}
                      className={`group bg-slate-800 border rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                        activeArticle === article.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => toggleArticle(article.id)}
                    >
                      <div className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm sm:text-base font-semibold mb-1 transition-colors ${activeArticle === article.id ? 'text-blue-400' : 'text-white group-hover:text-blue-500'}`}>
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-500">
                             <span className="flex items-center gap-1"><BookOpen size={12}/> {article.time} читання</span>
                          </div>
                        </div>
                        <ChevronRight 
                          className={`w-4 h-4 sm:w-5 h-5 text-slate-600 transition-transform duration-300 ${
                            activeArticle === article.id ? 'rotate-90 text-blue-500' : 'group-hover:text-blue-500'
                          }`} 
                        />
                      </div>

                      {/* Article Content (Accordion) */}
                      <div 
                        className={`transition-all duration-300 ease-in-out bg-slate-800/50 ${
                          activeArticle === article.id ? 'max-h-[500px] opacity-100 border-t border-slate-700/50' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-3 sm:pt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                          {article.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Help Box */}
            <div className="mt-8 sm:mt-12 bg-gradient-to-br from-blue-600/10 to-emerald-600/5 border border-blue-600/20 rounded-2xl p-6 sm:p-8 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl hidden xs:block">
                  <HelpCircle className="w-6 h-6 sm:w-8 h-8 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Не знайшли відповідь?</h3>
                  <p className="text-sm sm:text-base text-slate-400 mb-6">
                    Наша служба підтримки готова допомогти вам у будь-який час
                  </p>
                  <div className="flex flex-col xs:flex-row flex-wrap gap-3">
                    <a
                      href="https://mail.google.com/mail/u/1/#inbox?compose=CllgCJfttqHwjhlrssGmJTtztPvRHxjttvklgwrCHfqFnHTxzNlfCJmKNPvcwvqCBbVwjFqMzsq"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                      Зв'язатися з підтримкою
                    </a>
                    <a
                      href="https://github.com/IvanOmeliash"
                      className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                    >
                      <Github className="w-4 h-4" />
                      GitHub Discussions
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Updates Section */}
            <div className="mt-8 sm:mt-12 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Останні оновлення</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 group hover:border-slate-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-emerald-600/10 border border-emerald-600/20 rounded-lg shrink-0">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-white">Версія 2.4.0</h4>
                        <span className="text-[10px] sm:text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">03.01.2026</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed truncate sm:whitespace-normal">
                        Додано підтримку нових типів заяв та покращено швидкість роботи системи
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 group hover:border-slate-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-600/10 border border-blue-600/20 rounded-lg shrink-0">
                      <AlertCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h4 className="text-sm sm:text-base font-bold text-white">Оновлення документації</h4>
                        <span className="text-[10px] sm:text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">28.12.2025</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed truncate sm:whitespace-normal">
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

      <Footer />
    </div>
  );
}