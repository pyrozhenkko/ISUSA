import { Link } from 'react-router-dom';
import { 
    BookOpen, Shield,
    Github
} from 'lucide-react';
import "./index.css";

const Footer = () => {
    return(
        <footer className="border-t border-slate-800 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                <div className="col-span-2">
                    <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-lg text-white">ISUSA</span>
                    </Link>
                    <p className="text-slate-500 text-sm max-w-xs">
                    Проєкт створений для забезпечення безпечного та швидкого управління студентськими заявами в університеті.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-300">Проєкт</h4>
                    <ul className="space-y-3">
                    <li>
                        <Link to="/about" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                        Про систему
                        </Link>
                    </li>
                    <li>
                        <Link to="/docs" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                        Документація
                        </Link>
                    </li>
                    <li>
                        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-2">
                        <Github className="w-4 h-4" /> Repository
                        </a>
                    </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-4 text-slate-300">Правова інформація</h4>
                    <ul className="space-y-3">
                    <li>
                        <Link to="/privacy" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                        Конфіденційність
                        </Link>
                    </li>
                    <li>
                        <Link to="/status" className="text-sm text-slate-500 hover:text-blue-500 transition-colors">
                        Статус системи
                        </Link>
                    </li>
                    </ul>
                </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-600">
                    © {new Date().getFullYear()} ISUSA. Побудовано на стеку React + Spring Boot.
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span>RSA-2048 Encrypted</span>
                    </div>
                </div>
                </div>
            </div>
            </footer>
    )
}
export default Footer