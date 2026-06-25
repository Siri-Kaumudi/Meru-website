import { Link } from 'react-router-dom';
import SewingMachineIcon from './SewingMachineIcon';

export default function Footer() {
  return (
    <footer className="bg-primary-950 text-primary-300 py-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <SewingMachineIcon className="w-8 h-8" />
            <div>
              <div className="text-white font-bold">మేరు కుల సమాజం</div>
              <div className="text-xs text-primary-400">Meru Community — Telangana</div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:text-white transition-colors">హోమ్</Link>
            <Link to="/register" className="hover:text-white transition-colors">నమోదు</Link>
            <Link to="/admin" className="hover:text-white transition-colors text-xs">Admin</Link>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 text-center text-xs text-primary-500">
          <p>© {new Date().getFullYear()} మేరు కుల సమాజం, తెలంగాణ. అన్ని హక్కులు పరిరక్షితం.</p>
          <p className="mt-1">జనగణన నమోదు వెబ్‌సైట్ — Census Registration Portal</p>
        </div>
      </div>
    </footer>
  );
}
