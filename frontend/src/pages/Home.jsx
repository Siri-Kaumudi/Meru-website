import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import Navbar from '../components/Navbar';
import LiveCounter from '../components/LiveCounter';
import Footer from '../components/Footer';
import SewingMachineIcon from '../components/SewingMachineIcon';

/* Small leader circle used in the side columns */
function LeaderCircle({ photo, name, role, roleEn, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';
  const ring = size === 'lg'
    ? 'p-[4px]'
    : 'p-[3px]';

  return (
    <div className="text-center">
      <div
        className={`rounded-full ${ring} mx-auto shadow-xl`}
        style={{
          background: 'linear-gradient(to bottom, #FF6600 0%, #FF6600 33%, #ffffff 33%, #ffffff 66%, #138808 66%, #138808 100%)',
          width: 'fit-content',
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            className={`${dim} rounded-full object-cover object-top block`}
          />
        ) : (
          <div className={`${dim} rounded-full bg-primary-700 flex items-center justify-center block`}>
            <span className="text-primary-300 text-2xl">👤</span>
          </div>
        )}
      </div>
      <p className="text-white font-bold text-xs mt-2 leading-tight">{name}</p>
      {role && <p className="text-[#FF9933] text-[10px] font-semibold mt-0.5 leading-tight">{role}</p>}
      {roleEn && <p className="text-primary-300 text-[10px] leading-tight">{roleEn}</p>}
    </div>
  );
}

/* ── Leader data — add photo path when images are available ── */
const LEFT_LEADERS = [
  { photo: '/cm.jpeg',    name: 'శ్రీ ఎనుముల రేవంత్ రెడ్డి', role: 'తెలంగాణ ముఖ్యమంత్రి',       roleEn: 'Chief Minister, Telangana',    size: 'lg' },
  { photo: '/mahesh.jpg', name: 'శ్రీ బొమ్మ మహేష్ కుమార్ గౌడ్',  role: 'తెలంగాణ పిసిసి ప్రెసిడెంట్', roleEn: 'TS PCC President', size: 'lg' },
  { photo: '/sanga.jpeg', name: 'శ్రీ సంగ వెంకటరాజం మేరు', role: 'రాష్ట్ర మేరు కార్పోరేషన్ చైర్మన్', roleEn: 'State Meru Corporation Chairman', type: 'full', mobileFit: 'contain' },
];

const RIGHT_LEADERS = [
  { photo: '/batti.jpg', name: 'శ్రీ మల్లు భట్టి విక్రమార్క', role: 'తెలంగాణ డిప్యూటీ సీఎం', roleEn: 'Deputy CM, Telangana', size: 'lg' },
  { photo: '/prabhakar.jpg', name: 'శ్రీ పొన్నం ప్రభాకర్ గౌడ్', role: 'తెలంగాణ బీసీ సంక్షేమమంత్రి', roleEn: 'TS BC Welfare Minister', size: 'lg' },
  { photo: '/mera-vice-chairman.png', name: 'శ్రీ మాడిశెట్టి లక్ష్మీనారాయణ మేరు', role: 'రాష్ట్ర మేరు కార్పోరేషన్ వైస్ చైర్మన్', roleEn: 'State Meru Corporation Vice Chairman', type: 'full' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-950 via-primary-800 to-primary-700 text-white relative overflow-hidden">
        {/* Scattered sewing machine background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {[
            { top: '3%',  left: '2%',   w: 96, rot: -12 },
            { top: '5%',  left: '45%',  w: 88, rot:   5 },
            { top: '4%',  left: '83%',  w: 80, rot:  -8 },
            { top: '35%', left: '12%',  w: 92, rot:   8 },
            { top: '32%', left: '60%',  w: 84, rot:  -6 },
            { top: '58%', left: '2%',   w: 80, rot:  10 },
            { top: '55%', left: '38%',  w: 96, rot: -10 },
            { top: '57%', left: '75%',  w: 88, rot:   6 },
            { top: '80%', left: '18%',  w: 84, rot:  -7 },
            { top: '78%', left: '65%',  w: 92, rot:   9 },
          ].map((m, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: m.top, left: m.left, width: m.w, height: m.w, opacity: 0.03, transform: `rotate(${m.rot}deg)` }}
            >
              <SewingMachineIcon className="w-full h-full" />
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10 flex flex-col lg:flex-row items-start gap-8">

          {/* ── LEFT leaders column (desktop only) ── */}
          <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-52 pt-4">
            {/* Circle leaders */}
            <div className="flex flex-col items-center gap-6">
              {LEFT_LEADERS.filter(l => l.type !== 'full').map((l, i) => (
                <LeaderCircle key={i} {...l} />
              ))}
            </div>
            {/* Full-body photo — directly below circle leaders */}
            {LEFT_LEADERS.filter(l => l.type === 'full').map((l, i) => (
              <div key={i} className="text-center w-full mt-4">
                <img
                  src={l.photo}
                  alt={l.name}
                  className="drop-shadow-xl mx-auto"
                  style={{
                    width: '200px',
                    height: '290px',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  }}
                />
                <p className="text-white font-bold text-xs mt-3 leading-tight text-[16px]">{l.name}</p>
                {l.role && <p className="text-[#FF9933] text-[12px] font-semibold mt-1 leading-tight">{l.role}</p>}
                {l.roleEn && <p className="text-primary-300 text-[10px] mt-1 leading-tight">{l.roleEn}</p>}
              </div>
            ))}
          </div>

          {/* ── CENTER: Main hero content ── */}
          <div className="flex-1 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-full px-4 py-2 text-sm mb-6 mt-6">
              <SewingMachineIcon className="w-5 h-5" />
              <span className="text-primary-200">తెలంగాణ రాష్ట్రం · Telangana State</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
              రాష్ట్ర మేరు కార్పోరేషన్, తెలంగాణ
            </h1>
            <h2 className="text-base sm:text-lg font-medium text-primary-300 mb-2 tracking-wide pb-6">
              State Meru Corporation, Telangana
            </h2>
            {/* <p className="text-primary-300 text-lg mb-2">జనగణన నమోదు పోర్టల్</p>
            <p className="text-primary-400 text-sm mb-10">Community Census Registration Portal</p> */}

            {/* Tagline */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-4 mb-10 max-w-lg mx-auto border border-white border-opacity-15">
              <p className="text-base text-primary-100 leading-relaxed">
                "చేయి చేయి కలుపుదాం -  మేరకుల అభివృద్ధికి తోడ్పడుదాం"
              </p>
            </div>

            {/* Live Counter */}
            <div className="mb-10">
              {/* <p className="text-primary-300 text-sm mb-4">ఇప్పటివరకు నమోదైన వారు / Total Registered So Far</p> */}
              <LiveCounter />
            </div>

            {/* Big Register Button */}
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-white font-bold text-base sm:text-xl lg:text-2xl px-6 py-3 sm:px-10 sm:py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-200 active:scale-95 group w-full sm:w-auto justify-center"
            >
              <ClipboardList className="w-7 h-7 group-hover:scale-110 transition-transform" />
              <span>ఇప్పుడే నమోదు చేయండి</span>
            </Link>
            <p className="text-primary-400 text-sm mt-3">Register Your Family Now — Free &amp; Easy</p>

            {/* ── Mobile leaders — visible only below lg ── */}
            <div className="lg:hidden mt-8 pb-2">
              {/* 4 circle leaders in 2×2 grid */}
              <div className="grid grid-cols-2 gap-5 max-w-xs mx-auto mb-6">
                {[LEFT_LEADERS[0], RIGHT_LEADERS[0], LEFT_LEADERS[1], RIGHT_LEADERS[1]].map((l, i) => (
                  <LeaderCircle key={i} {...l} size="sm" />
                ))}
              </div>
              {/* 2 full-body leaders side by side — fixed height so both look the same size */}
              <div className="flex justify-center items-start gap-3 px-2">
                {[LEFT_LEADERS[2], RIGHT_LEADERS[2]].map((l, i) => (
                  <div key={i} className="text-center flex-1 max-w-[168px] min-w-0">
                    <div
                      className="mx-auto w-[145px] h-[200px] overflow-hidden drop-shadow-xl"
                      style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                      }}
                    >
                      <img
                        src={l.photo}
                        alt={l.name}
                        className={`w-full h-full object-top ${l.mobileFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                      />
                    </div>
                    <p className="text-white font-bold text-[11px] mt-1 leading-tight">{l.name}</p>
                    {l.role && <p className="text-[#FF9933] text-[10px] font-semibold mt-0.5 leading-tight">{l.role}</p>}
                    {l.roleEn && <p className="text-primary-300 text-[10px] leading-tight">{l.roleEn}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT leaders column (desktop only) ── */}
          <div className="hidden lg:flex flex-col items-center flex-shrink-0 w-52 pt-4">
            {/* Circle leaders */}
            <div className="flex flex-col items-center gap-6">
              {RIGHT_LEADERS.filter(l => l.type !== 'full').map((l, i) => (
                <LeaderCircle key={i} {...l} />
              ))}
            </div>
            {/* Full-body photo — directly below circle leaders */}
            {RIGHT_LEADERS.filter(l => l.type === 'full').map((l, i) => (
              <div key={i} className="text-center w-full mt-0">
                <div
                  className="mx-auto overflow-hidden"
                  style={{
                    width: '260px',
                    height: '310px',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                  }}
                >
                  <img
                    src={l.photo}
                    alt={l.name}
                    className="drop-shadow-xl"
                    style={{
                      width: '260px',
                      height: 'auto',
                      display: 'block',
                      marginTop: '-70px',
                    }}
                  />
                </div>
                <p className="text-white font-bold text-xs mt-3 leading-tight text-[16px]">{l.name}</p>
                {l.role && <p className="text-[#FF9933] text-[12px] font-semibold mt-1 leading-tight">{l.role}</p>}
                {l.roleEn && <p className="text-primary-300 text-[10px] mt-1 leading-tight">{l.roleEn}</p>}
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
