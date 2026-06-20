import { useEffect, useState, useRef } from 'react';
import { Users, Home } from 'lucide-react';
import { getCount } from '../utils/api';

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    const diff = end - start;
    const duration = 600;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prevRef.current = end;
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display.toLocaleString('en-IN')}</span>;
}

function CountBox({ icon: Icon, iconColor, label, value, loading }) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-center w-full sm:min-w-[140px] sm:w-auto">
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-primary-200 text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white pt-1">
        {loading ? (
          <span className="text-lg text-primary-300 animate-pulse">...</span>
        ) : (
          <AnimatedNumber value={value} />
        )}
      </div>
    </div>
  );
}

export default function LiveCounter() {
  const [counts, setCounts] = useState({ households: 0, individuals: 0, males: 0, females: 0 });
  const [loading, setLoading] = useState(true);

  async function fetchCount() {
    try {
      const res = await getCount();
      setCounts({
        households: res.data.households || 0,
        individuals: res.data.individuals || 0,
        males: res.data.males || 0,
        females: res.data.females || 0,
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    /* 2-col grid on mobile, flex-wrap on sm+ */
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 justify-center items-center">
      <CountBox icon={Home}  iconColor="text-gold-400" label="కుటుంబాలు"  value={counts.households}  loading={loading} />
      <CountBox icon={Users} iconColor="text-gold-400" label="మొత్తం"     value={counts.individuals} loading={loading} />
      <CountBox icon={Users} iconColor="text-blue-300" label="పురుషులు"   value={counts.males}       loading={loading} />
      <CountBox icon={Users} iconColor="text-pink-300" label="స్త్రీలు"   value={counts.females}     loading={loading} />
    </div>
  );
}
