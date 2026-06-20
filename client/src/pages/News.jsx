import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getNews } from '../utils/api';

// Static photos always shown first (before admin-added ones)
const STATIC_SLIDES = [
  { _id: 'static-1', imageData: '/newsphoto1.jpeg', title: '', description: '' },
  { _id: 'static-2', imageData: '/newsphoto2.jpeg', title: '', description: '' },
  { _id: 'static-3', imageData: '/newsphoto3.jpeg', title: '', description: '' },
  { _id: 'static-4', imageData: '/newsphoto4.jpeg', title: '', description: '' },
];

const INTERVAL_MS = 4000;

export default function News() {
  const [slides, setSlides] = useState(STATIC_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  // Fetch admin-added news and merge after static slides
  useEffect(() => {
    getNews()
      .then(({ data }) => {
        const dynamic = (data.items || []).map((item) => ({
          ...item,
          imageData: item.imageData,
        }));
        setSlides([...STATIC_SLIDES, ...dynamic]);
      })
      .catch(() => setError('వార్తలు లోడ్ కాలేదు. స్టాటిక్ ఫోటోలు మాత్రమే చూపిస్తున్నాం.'))
      .finally(() => setLoading(false));
  }, []);

  const total = slides.length;

  const goTo = useCallback((idx) => {
    setCurrent((idx + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, total, next]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  // Touch/swipe support
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Page header */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-4 px-4 text-center">
        <h1 className="text-xl font-bold">మేర కార్పోరేషన్ వార్తలు · News</h1>
      </section>

      {/* Carousel */}
      <main className="flex-1 pt-3 pb-8 px-0">
        <div className="max-w-4xl mx-auto">

          {loading ? (
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-pulse">
              <div className="bg-gray-200 w-full" style={{ aspectRatio: '16/9' }} />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm text-center">
                  ⚠️ {error}
                </div>
              )}

              {/* Main carousel card */}
              <div
                className="relative bg-white rounded-3xl shadow-xl overflow-hidden select-none"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label="News carousel"
              >
                {/* Image */}
                <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
                  {slides.map((s, i) => (
                    <img
                      key={s._id}
                      src={s.imageData}
                      alt={s.title || `వార్త ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                      style={{ opacity: i === current ? 1 : 0 }}
                      draggable={false}
                    />
                  ))}

                  {/* Prev / Next buttons */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Counter badge */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                    {current + 1} / {total}
                  </div>

                </div>

                {/* Caption (only if title/description set) */}
                {(slide?.title || slide?.description) && (
                  <div className="px-6 py-4 border-t border-gray-100">
                    {slide.title && <h2 className="font-bold text-primary-900 text-lg leading-tight">{slide.title}</h2>}
                    {slide.description && <p className="text-gray-600 text-sm mt-1 leading-relaxed">{slide.description}</p>}
                  </div>
                )}
              </div>

              {/* Dot indicators */}
              {total > 1 && (
                <div className="flex justify-center gap-2 mt-5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === current
                          ? 'w-6 h-2.5 bg-primary-700'
                          : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnails row */}
              {total > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
                  {slides.map((s, i) => (
                    <button
                      key={s._id}
                      onClick={() => goTo(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        i === current ? 'border-primary-600 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={s.imageData} alt="" className="w-full h-full object-cover" draggable={false} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty state (should not happen with static slides, but just in case) */}
          {!loading && total === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">వార్తలు అందుబాటులో లేవు</p>
              <p className="text-sm">No news available at the moment.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
