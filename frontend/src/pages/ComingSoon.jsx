import { Link, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SewingMachineIcon from '../components/SewingMachineIcon';

const PAGE_META = {
  '/news':     { te: 'వార్తలు',    en: 'News' },
  '/census':   { te: 'జనగణన',     en: 'Census' },
  '/marriage': { te: 'వివాహం',    en: 'Marriage' },
  '/jobs':     { te: 'ఉద్యోగాలు', en: 'Jobs' },
};

export default function ComingSoon() {
  const { pathname } = useLocation();
  const meta = PAGE_META[pathname] || { te: 'పేజీ', en: 'Page' };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20 bg-gradient-to-b from-primary-50 to-white">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <SewingMachineIcon className="w-10 h-10 sm:w-12 sm:h-12" white={false} />
          </div>

          <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-5">
            <Clock className="w-4 h-4" />
            త్వరలో వస్తుంది · Coming Soon
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-primary-900 mb-1">{meta.te}</h1>
          <p className="text-base sm:text-lg text-primary-600 font-medium mb-5">{meta.en}</p>

          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            ఈ విభాగం త్వరలో అందుబాటులోకి వస్తుంది.<br />
            This section will be available soon.
          </p>

          <Link to="/" className="inline-flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white font-semibold px-6 py-3 rounded-xl transition-all">
            ← హోమ్ పేజీకి వెళ్ళండి
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
