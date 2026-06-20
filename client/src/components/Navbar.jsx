import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SewingMachineIcon from './SewingMachineIcon';

const NAV_LINKS = [
  { to: '/',         te: 'హోమ్',       en: 'Home' },
  { to: '/news',     te: 'వార్తలు',    en: 'News' },
  { to: '/census',   te: 'జనగణన',     en: 'Census' },
  { to: '/marriage', te: 'వివాహం',    en: 'Marriage' },
  { to: '/jobs',     te: 'ఉద్యోగాలు', en: 'Jobs' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-primary-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0" onClick={() => setOpen(false)}>
          <SewingMachineIcon className="w-9 h-9 sm:w-12 sm:h-12" />
          <div>
            <div className="font-bold text-sm sm:text-base leading-tight">మేర కార్పోరేషన్, తెలంగాణ</div>
            <div className="text-[10px] sm:text-xs text-primary-300 leading-tight">Mera Corporation, Telangana</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="ml-auto hidden md:flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {NAV_LINKS.map(({ to, te, en }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  active
                    ? 'bg-white bg-opacity-15 text-white'
                    : 'text-primary-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {te}/{en}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="ml-auto md:hidden p-2 rounded-xl hover:bg-primary-700 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden bg-primary-800 border-t border-primary-700">
          {NAV_LINKS.map(({ to, te, en }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-5 py-4 text-base font-semibold border-b border-primary-700 last:border-0 transition-colors ${
                  active
                    ? 'bg-white bg-opacity-10 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`}
              >
                <span>{te}</span>
                <span className="text-primary-400 text-sm">{en}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
