import { LEADERS } from '../data/leaders';

function AvatarPlaceholder({ name }) {
  const initials = name
    .split(' ')
    .filter((w) => w.length > 1)
    .slice(-2)
    .map((w) => w[0])
    .join('');

  return (
    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center border-4 border-white shadow-md mx-auto">
      <span className="text-white text-2xl font-bold">{initials || '👤'}</span>
    </div>
  );
}

export default function LeadersSection() {
  return (
    <section className="py-16 bg-white" id="leaders">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <span>⭐</span>
            <span>మా నాయకులు / Our Leaders</span>
          </div>
          <h2 className="text-3xl font-bold text-primary-900 mb-3">
            మేరు కుల సమాజం నాయకత్వం
          </h2>
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            Meru Darji Community Leadership — Telangana State
          </p>
        </div>

        {/* Leaders Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {LEADERS.map((leader) => (
            <div
              key={leader.id}
              className="group text-center p-4 rounded-2xl hover:bg-primary-50 transition-all duration-200 hover:shadow-md"
            >
              <div className="relative mb-3">
                {leader.photo ? (
                  <img
                    src={leader.photo}
                    alt={leader.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md mx-auto group-hover:border-primary-300 transition-all"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <AvatarPlaceholder name={leader.name} />
              </div>

              <h3 className="font-bold text-primary-900 text-sm leading-tight mb-1">
                {leader.name}
              </h3>

              <div className="bg-primary-700 text-white text-xs rounded-full px-3 py-1 font-medium leading-snug">
                {leader.designation}
              </div>
              <div className="text-gray-400 text-xs mt-1">{leader.designationEn}</div>
            </div>
          ))}
        </div>

        {/* Note for user */}
        <p className="text-center text-xs text-gray-400 mt-8 italic">
          * నాయకుల ఫొటోలు మరియు పేర్లు నమోదు చేయడానికి <code className="bg-gray-100 px-1 rounded">src/data/leaders.js</code> ఫైల్ అప్‌డేట్ చేయండి
        </p>
      </div>
    </section>
  );
}
