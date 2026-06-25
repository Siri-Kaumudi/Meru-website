import { Link } from 'react-router-dom';
import { ClipboardList, Users, TrendingUp, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import LiveCounter from '../components/LiveCounter';
import Footer from '../components/Footer';

const FEATURES = [
  { icon: ClipboardList, title: 'సులభమైన నమోదు',  desc: 'కొద్ది నిమిషాల్లో మీ కుటుంబ వివరాలు నమోదు చేయండి' },
  { icon: Users,         title: 'కుటుంబ సర్వే',   desc: 'ఒకే ఫారంలో మొత్తం కుటుంబం నమోదు అవుతుంది' },
  { icon: TrendingUp,    title: 'లైవ్ గణాంకాలు', desc: 'మొత్తం నమోదు సంఖ్య తక్షణం చూడవచ్చు' },
  { icon: Shield,        title: 'సురక్షిత డేటా',  desc: 'మీ వ్యక్తిగత సమాచారం పూర్తిగా సురక్షితంగా ఉంటుంది' },
];

const STEPS = [
  'కుటుంబ వివరాలు నమోదు చేయండి',
  'సభ్యుల వివరాలు జోడించండి',
  'నిర్ధారించి సమర్పించండి',
];

export default function Census() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-10 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">జనగణన నమోదు</h1>
        <p className="text-primary-300 text-lg">Community Census Registration</p>
        <div className="mt-6">
          <p className="text-primary-300 text-sm mb-3">ఇప్పటివరకు నమోదైన వారు / Total Registered So Far</p>
          <LiveCounter />
        </div>
      </section>
          {/* Steps */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-gray-700 font-medium text-sm">{step}</span>
                {i < 2 && <span className="hidden sm:block text-primary-300 text-2xl">→</span>}
              </div>
            ))}
          </div>

          {/* Register CTA */}
          <div className="text-center mt-10">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-base sm:text-xl px-6 py-3 sm:px-10 sm:py-5 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 w-full sm:w-auto justify-center"
            >
              <ClipboardList className="w-6 h-6" />
              ఇప్పుడే నమోదు చేయండి
            </Link>
            <p className="text-gray-400 text-sm mt-3">Register Your Family Now — Free &amp; Easy</p>
          </div>
      {/* How it works */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-primary-900">నమోదు ఎలా చేయాలి?</h2>
            <p className="text-gray-500 text-sm mt-1">How to Register</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center p-5 rounded-2xl hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-700" />
                </div>
                <h3 className="font-bold text-primary-800 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
