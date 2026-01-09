import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Shield, 
  Bell, 
  LogOut, 
  User,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileText,
  AlertTriangle,
  Mail,
  CheckCircle
} from 'lucide-react';
import Footer from './Footer';

export default function PrivacyPolicy() {
  const sections = [
    {
      id: 'collection',
      title: 'Збір інформації',
      icon: Database,
      content: [
        {
          subtitle: 'Персональні дані',
          text: 'Ми збираємо особисту інформацію, яку ви надаєте при реєстрації: ПІБ, електронна пошта, номер студентського квитка, факультет та група.'
        },
        {
          subtitle: 'Автоматично зібрані дані',
          text: 'IP-адреса, тип браузера, час доступу, сторінки перегляду - для забезпечення безпеки та покращення якості сервісу.'
        },
        {
          subtitle: 'Файли та документи',
          text: 'Документи, які ви завантажуєте та створюєте в системі, зберігаються в зашифрованому вигляді.'
        }
      ]
    },
    {
      id: 'usage',
      title: 'Використання інформації',
      icon: FileText,
      content: [
        {
          subtitle: 'Основне призначення',
          text: 'Ваші дані використовуються виключно для обробки заяв, підтримки вашого профілю та забезпечення роботи системи.'
        },
        {
          subtitle: 'Комунікація',
          text: 'Відправка сповіщень про статус заяв, оновлення системи та важливі повідомлення від адміністрації.'
        },
        {
          subtitle: 'Аналітика',
          text: 'Аналіз використання системи для покращення функціоналу (тільки анонімізовані дані).'
        }
      ]
    },
    {
      id: 'protection',
      title: 'Захист даних',
      icon: Lock,
      content: [
        {
          subtitle: 'Шифрування',
          text: 'Всі дані передаються через захищене з\'єднання SSL/TLS. Цифрові підписи використовують RSA-2048 шифрування.'
        },
        {
          subtitle: 'Контроль доступу',
          text: 'Багаторівнева система прав доступу. Тільки авторизовані особи можуть переглядати ваші заяви.'
        },
        {
          subtitle: 'Резервне копіювання',
          text: 'Регулярні автоматичні бекапи з шифруванням для запобігання втрати даних.'
        }
      ]
    },
    {
      id: 'sharing',
      title: 'Передача третім особам',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Університет',
          text: 'Дані передаються тільки відповідним департаментам університету для обробки ваших заяв.'
        },
        {
          subtitle: 'Законодавчі вимоги',
          text: 'Можемо розкрити інформацію, якщо це вимагається законом або судовим рішенням.'
        },
        {
          subtitle: 'Відсутність продажу',
          text: 'Ми НІКОЛИ не продаємо, не здаємо в оренду та не передаємо ваші персональні дані третім сторонам в комерційних цілях.'
        }
      ]
    },
    {
      id: 'rights',
      title: 'Ваші права',
      icon: Eye,
      content: [
        {
          subtitle: 'Доступ до даних',
          text: 'Ви маєте право в будь-який час переглянути всі зібрані про вас дані.'
        },
        {
          subtitle: 'Виправлення',
          text: 'Можете запитати виправлення неточних або неповних персональних даних.'
        },
        {
          subtitle: 'Видалення',
          text: 'Можете запитати видалення вашого акаунту та всіх пов\'язаних даних (за виключенням архівних записів, які вимагаються законодавством).'
        },
        {
          subtitle: 'Експорт',
          text: 'Можете запитати копію всіх ваших даних у зручному форматі.'
        }
      ]
    }
  ];

  const principles = [
    {
      icon: Shield,
      title: 'Мінімізація даних',
      description: 'Збираємо тільки необхідну інформацію'
    },
    {
      icon: Lock,
      title: 'Шифрування',
      description: 'Всі дані захищені сучасними методами'
    },
    {
      icon: CheckCircle,
      title: 'Прозорість',
      description: 'Чітко повідомляємо про використання даних'
    },
    {
      icon: UserCheck,
      title: 'Контроль',
      description: 'Ви контролюєте свої персональні дані'
    }
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
              <span className="text-xs sm:text-sm text-slate-400">Privacy</span>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-600/20 rounded-full text-xs sm:text-sm text-emerald-400 mb-6">
            <Shield className="w-4 h-4" />
            Політика конфіденційності
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-white tracking-tight font-bold">
            Ваша <span className="text-emerald-500">приватність</span> важлива
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-6 max-w-2xl mx-auto">
            Ми серйозно ставимося до захисту ваших персональних даних та дотримуємось найвищих стандартів безпеки.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <span>Останнє оновлення:</span>
            <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">03 січня 2026</span>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Principles */}
        <section className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl text-white mb-8 text-center font-bold">Наші принципи</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {principles.map((principle, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 text-center hover:border-blue-500/30 transition-colors">
                <div className="inline-flex p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg mb-4">
                  <principle.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <h3 className="text-white text-sm sm:text-base font-semibold mb-2">{principle.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Important Notice */}
        <div className="bg-amber-600/10 border border-amber-600/20 rounded-2xl p-5 sm:p-6 mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-white font-bold mb-2">Важливо знати</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                ISUSA НЕ призначена для збору чутливої особистої інформації (ПІБ). 
                Система створена для роботи з академічними документами в освітніх цілях. 
                Будь ласка, не вказуйте дані медичних, фінансових або інших конфіденційних особистих документів без необхідності.
              </p>
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-10 sm:space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 sm:p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                  <section.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{section.title}</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {section.content.map((item, index) => (
                  <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6 shadow-sm hover:border-slate-600 transition-colors">
                    <h3 className="text-base sm:text-lg text-white font-semibold mb-3">{item.subtitle}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Cookies Section */}
        <section className="mt-10 sm:mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 sm:p-3 bg-purple-600/10 border border-purple-600/20 rounded-xl">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Cookies та локальне сховище</h2>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6">
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4 font-medium">
              Ми використовуємо cookies та локальне сховище браузера для:
            </p>
            <ul className="space-y-3">
              {[
                'Підтримки вашої сесії після входу в систему',
                'Збереження ваших налаштувань інтерфейсу',
                'Аналізу використання сервісу (анонімно)',
                'Забезпечення безпеки та запобігання шахрайству'
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-400">
                  <CheckCircle className="w-4 h-4 sm:w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mt-10 sm:mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 sm:p-3 bg-blue-600/10 border border-blue-600/20 rounded-xl">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Термін зберігання даних</h2>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6">
            <div className="space-y-6">
              {[
                { title: 'Активні акаунти', text: 'Дані зберігаються протягом усього періоду вашого навчання в університеті.' },
                { title: 'Архівні документи', text: 'Підписані заяви зберігаються відповідно до вимог університету (зазвичай 5 років після закінчення навчання).' },
                { title: 'Видалені акаунти', text: 'Після видалення акаунту персональні дані видаляються протягом 30 днів. Архівні документи можуть зберігатися анонімно згідно з законодавством.' }
              ].map((item, idx) => (
                <div key={idx}>
                  <h4 className="text-white text-sm sm:text-base font-semibold mb-1.5">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section className="mt-10 sm:mt-12">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 sm:p-6">
            <h3 className="text-lg sm:text-xl text-white font-bold mb-4">Зміни в політиці конфіденційності</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 leading-relaxed">
              Ми можемо час від часу оновлювати цю політику. Про значні зміни ми повідомимо вас через:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400 mb-4">
              {['Email-повідомлення', 'Сповіщення в системі', 'Оголошення на головній сторінці'].map(item => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs sm:text-sm text-slate-500 italic">
              Рекомендуємо періодично переглядати цю сторінку для відстеження оновлень.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 sm:mt-12">
          <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/10 border border-blue-600/20 rounded-2xl p-6 sm:p-8 text-center shadow-lg">
            <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Маєте питання?</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
              Якщо у вас є запитання щодо політики конфіденційності або ви хочете скористатися своїми правами, 
              будь ласка, зв'яжіться з нами
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-slate-400">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <span className="font-bold text-slate-300">Email:</span>
                <a href="mailto:asu.dept@lpnu.ua" className="text-blue-500 hover:text-blue-400 transition-colors">asu.dept@lpnu.ua</a>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <span className="font-bold text-slate-300">Телефон:</span>
                <span>+38 (032)-258-26-47</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 max-w-sm mx-auto">
                <span className="font-bold text-slate-300 shrink-0">Адреса:</span>
                <span>вул. С. Бандери 28а, 5-й н.к., кім. 801</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}