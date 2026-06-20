import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, Users, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SewingMachineIcon from '../components/SewingMachineIcon';

export default function Success() {
  const location = useLocation();
  const { memberCount = 1, householdId } = location.state || {};

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'మేరు కుల సమాజం జనగణన',
        text: 'నేను మేరు కుల సమాజం జనగణనలో నమోదు చేసాను. మీరు కూడా నమోదు చేసుకోండి!',
        url: window.location.origin,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-md w-full text-center animate-slide-up">
          {/* Success Icon */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center border-2 border-white">
              <SewingMachineIcon className="w-6 h-6" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            నమోదు విజయవంతమైంది! 🎉
          </h1>
          <p className="text-xl font-semibold text-green-600 mb-4">
            Registration Successful!
          </p>

          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-center gap-3 text-primary-700">
              <Users className="w-6 h-6" />
              <span className="text-lg font-semibold">{memberCount} సభ్యులు నమోదయ్యారు</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{memberCount} members registered</p>

            <div className="mt-4 p-3 bg-primary-50 rounded-xl text-xs text-primary-700 text-left">
              <p className="font-semibold mb-1">మీ నమోదు నంబర్ / Reference ID:</p>
              <code className="text-primary-900 font-mono break-all">{householdId || 'N/A'}</code>
            </div>
          </div>

          {/* Thank you message */}
          <div className="bg-primary-50 rounded-2xl p-5 mb-6 text-left">
            <p className="text-primary-800 font-semibold mb-2">🙏 ధన్యవాదాలు!</p>
            <p className="text-primary-700 text-sm leading-relaxed">
              మేరు కుల సమాజం జనగణనలో మీ భాగస్వామ్యానికి హృదయపూర్వక ధన్యవాదాలు.
              మీ సమాచారం మన సమాజ అభివృద్ధికి చాలా విలువైనది.
            </p>
            <p className="text-primary-600 text-xs mt-2 italic">
              Thank you for participating in the Meru Community Census. Your information is valuable for our community development.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              హోమ్ పేజీ
            </Link>
            <button onClick={handleShare} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              మిత్రులకు పంచండి
            </button>
          </div>

          <p className="text-gray-400 text-xs mt-6">
            మీ బంధువులను, మిత్రులను కూడా నమోదు చేయమని అభ్యర్థించండి.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
