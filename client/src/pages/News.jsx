import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getNews } from '../utils/api';

const INTERVAL_MS = 4000;

export default function News() {
  const [slides, setSlides]   = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    getNews()
      .then(({ data }) => {
        const dynamic = (data.items || []).map((item) => ({ ...item }));
        setSlides(dynamic);
      })
      .catch(() => setError('వార్తలు లోడ్ కాలేదు.'))
      .finally(() => setLoading(false));
  }, []);

  const total = slides.length;

  const goTo = useCallback((idx) => setCurrent((idx + total) % total), [total]);
  const next  = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev  = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, total, next]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const slide = slides[current];

  return (
    /* Viewport-locked — no page scroll */
    <div
      className="flex flex-col bg-gray-50"
      style={{ height: '100dvh', overflow: 'hidden' }}
    >
      <Navbar />

      {/* Compact page header */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white py-2 px-4 text-center flex-shrink-0">
        <h1 className="text-sm font-bold tracking-wide">మేర కార్పోరేషన్ వార్తలు · News</h1>
      </section>

      {/* Main — fills remaining height */}
      <main className="flex-1 min-h-0 flex flex-col py-2 px-3">
        <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0">

          {error && (
            <div className="mb-2 flex-shrink-0 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-2 text-xs text-center">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex-1 bg-white rounded-2xl shadow-lg animate-pulse bg-gray-200" />
          ) : total === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Newspaper className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">వార్తలు అందుబాటులో లేవు</p>
              <p className="text-sm">No news available at the moment.</p>
            </div>
          ) : (
            <>
              {/* Carousel card — fills available height */}
              <div
                className="flex-1 min-h-0 relative bg-white rounded-2xl shadow-xl overflow-hidden select-none flex flex-col"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label="News carousel"
              >
                {/* Image area — fills card */}
                <div className="flex-1 min-h-0 relative bg-gray-900">
                  {slides.map((s, i) => (
                    <img
                      key={s._id}
                      src={s.imageData}
                      alt={s.title || `వార్త ${i + 1}`}
                      style={{
                        position  : 'absolute',
                        inset     : 0,
                        width     : '100%',
                        height    : '100%',
                        objectFit : 'contain',
                        opacity   : i === current ? 1 : 0,
                        transition: 'opacity 0.7s',
                      }}
                      draggable={false}
                    />
                  ))}

                  {/* Prev / Next */}
                  {total > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black bg-opacity-40 hover:bg-opacity-60 text-white rounded-full flex items-center justify-center transition-all z-10 backdrop-blur-sm"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Counter */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                    {current + 1} / {total}
                  </div>
                </div>

                {/* Caption */}
                {(slide?.title || slide?.description) && (
                  <div className="flex-shrink-0 px-5 py-3 border-t border-gray-100">
                    {slide.title       && <h2 className="font-bold text-primary-900 text-base leading-tight">{slide.title}</h2>}
                    {slide.description && <p  className="text-gray-600 text-xs mt-1 leading-relaxed">{slide.description}</p>}
                  </div>
                )}
              </div>

              {/* Dot indicators */}
              {total > 1 && (
                <div className="flex justify-center gap-1.5 mt-2 flex-shrink-0">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === current
                          ? 'w-5 h-2 bg-primary-700'
                          : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnails */}
              {total > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide flex-shrink-0">
                  {slides.map((s, i) => (
                    <button
                      key={s._id}
                      onClick={() => goTo(i)}
                      className={`flex-shrink-0 w-14 h-11 rounded-lg overflow-hidden border-2 transition-all ${
                        i === current
                          ? 'border-primary-600 scale-105 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={s.imageData} alt="" className="w-full h-full object-cover" draggable={false} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
