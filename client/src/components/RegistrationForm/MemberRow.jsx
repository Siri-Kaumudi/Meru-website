import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { RELATIONSHIP_OPTIONS } from '../../utils/districts';

// Capitalise first letter of each word, but only for pure-English input
function toTitleCase(v) {
  return /[^\x00-\x7F]/.test(v) ? v : v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

// Display helpers — store raw digits, show formatted
function formatAadhaar(digits) {
  return (digits || '').replace(/(\d{4})(?=\d)/g, '$1 ');
}
function formatMobile(digits) {
  const d = digits || '';
  return d.length > 5 ? d.slice(0, 5) + ' ' + d.slice(5) : d;
}

// required: true means user MUST pick a value — toggle won't deselect on re-click
const YES_NO_FIELDS = [
  {
    key: 'ownHouse',
    label: 'సొంత ఇల్లు', labelEn: 'Own House',
    required: true,
    headOnly: true,
    options: [
      { value: 'ఉన్నది', te: 'ఉన్నది', en: 'Yes' },
      { value: 'లేదు',   te: 'లేదు',   en: 'No'  },
    ],
  },
  {
    key: 'maritalStatus',
    label: 'వివాహ స్థితి', labelEn: 'Marital Status',
    required: true,
    options: [
      { value: 'వివాహిత',  te: 'వివాహిత',  en: 'Married'   },
      { value: 'అవివాహిత', te: 'అవివాహిత', en: 'Unmarried' },
      { value: 'వితంతువు', te: 'వితంతువు', en: 'Widowed'   },
      { value: 'విడాకులు', te: 'విడాకులు', en: 'Divorced'  },
    ],
  },
  {
    key: 'governmentPension',
    label: 'ప్రభుత్వ పెన్షన్', labelEn: 'Govt Pension',
    required: false,
    options: [
      { value: 'వస్తుంది', te: 'వస్తుంది', en: 'Yes' },
      { value: 'లేదు',     te: 'లేదు',     en: 'No'  },
    ],
  },
  {
    key: 'rationCard',
    label: 'రేషన్ కార్డు', labelEn: 'Ration Card',
    required: false,
    headOnly: true,
    options: [
      { value: 'ఉంది', te: 'ఉంది', en: 'Yes' },
      { value: 'లేదు', te: 'లేదు', en: 'No'  },
    ],
  },
  {
    key: 'freeUnits200',
    label: 'ఉచిత కరెంటు (200 Units)', labelEn: 'Free Current (200 Units)',
    required: true,
    headOnly: true,
    options: [
      { value: 'వస్తుంది', te: 'వస్తుంది', en: 'Yes' },
      { value: 'లేదు',     te: 'లేదు',     en: 'No'  },
    ],
  },
];

export default function MemberRow({ member, index, onChange, onRemove, errors, canRemove, isHead }) {
  const [expanded, setExpanded] = useState(true);

  const field = (key) => ({
    value: member[key] || '',
    onChange: (e) => onChange(index, key, toTitleCase(e.target.value)),
    className: `input-field text-sm py-2 ${errors[`member_${index}_${key}`] ? 'input-error' : ''}`,
  });

  const err = (key) => errors[`member_${index}_${key}`];

  function handleToggle(key, value, required) {
    // Required fields cannot be deselected — clicking the same option does nothing
    if (required && member[key] === value) return;
    onChange(index, key, member[key] === value ? '' : value);
  }

  return (
    <div className={`rounded-2xl border-2 ${isHead ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white'} overflow-hidden`}>
      {/* Row Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer ${isHead ? 'bg-primary-700 text-white' : 'bg-gray-50 text-gray-700'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isHead ? 'bg-white text-primary-700' : 'bg-primary-100 text-primary-700'}`}>
            {index + 1}
          </div>
          <div>
            <span className="font-semibold text-sm">
              {member.name || (isHead ? 'కుటుంబయజమాని' : `సభ్యుడు ${index + 1}`)}
            </span>
            {isHead && <span className={`ml-2 text-xs ${isHead ? 'text-primary-200' : 'text-gray-400'}`}>(Head of Family)</span>}
            {member.age ? <span className={`ml-2 text-xs ${isHead ? 'text-primary-200' : 'text-gray-400'}`}>వయస్సు: {member.age}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(index); }}
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              title="సభ్యుడిని తొలగించు"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Row Fields */}
      {expanded && (
        <div className="p-4 space-y-4">

          {/* ── Main fields grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Surname */}
            <div>
              <label className="label-field text-xs">
                ఇంటి పేరు <span className="text-gray-400 font-normal">(ఐచ్ఛికం)</span>
                <span className="block font-normal text-gray-400">Surname (Optional)</span>
              </label>
              <input type="text" placeholder="ఇంటి పేరు నమోదు చేయండి" maxLength={100} {...field('surname')} />
            </div>

            {/* Full Name */}
            <div>
              <label className="label-field text-xs">
                పూర్తి పేరు <span className="text-red-500">*</span>
                <span className="block font-normal text-gray-400">Full Name</span>
              </label>
              <input type="text" placeholder="పూర్తి పేరు నమోదు చేయండి" maxLength={100} {...field('name')} />
              {err('name') && <p className="text-red-500 text-xs mt-1">{err('name')}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="label-field text-xs">
                లింగం <span className="text-red-500">*</span>
                <span className="block font-normal text-gray-400">Gender</span>
              </label>
              <div className="flex gap-3 mt-2">
                {['పురుషుడు', 'స్త్రీ'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`gender_${index}`}
                      value={g}
                      checked={member.gender === g}
                      onChange={() => onChange(index, 'gender', g)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{g}</span>
                  </label>
                ))}
              </div>
              {err('gender') && <p className="text-red-500 text-xs mt-1">{err('gender')}</p>}
            </div>

            {/* Age */}
            <div>
              <label className="label-field text-xs">
                వయస్సు <span className="text-red-500">*</span>
                <span className="block font-normal text-gray-400">Age</span>
              </label>
              <input
                type="number"
                placeholder="వయస్సు"
                min={0}
                max={120}
                {...field('age')}
                onChange={(e) => onChange(index, 'age', e.target.value)}
                className={`input-field text-sm py-2 ${err('age') ? 'input-error' : ''}`}
              />
              {err('age') && <p className="text-red-500 text-xs mt-1">{err('age')}</p>}
            </div>

            {/* Relationship with Head */}
            <div>
              <label className="label-field text-xs">
                కుటుంబయజమానితో సంబంధం <span className="text-red-500">*</span>
                <span className="block font-normal text-gray-400">Relationship with Head</span>
              </label>
              {isHead ? (
                <input type="text" value="కుటుంబయజమాని" readOnly className="input-field text-sm py-2 bg-gray-50 cursor-not-allowed" />
              ) : (
                <select {...field('relationshipWithHead')}>
                  <option value="">-- సంబంధం ఎంచుకోండి --</option>
                  {RELATIONSHIP_OPTIONS.filter((r) => r !== 'కుటుంబయజమాని').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}
              {err('relationshipWithHead') && <p className="text-red-500 text-xs mt-1">{err('relationshipWithHead')}</p>}
            </div>

            {/* Occupation / Education */}
            <div>
              <label className="label-field text-xs">
                వృత్తి / ఉద్యోగం / చదువు
                <span className="block font-normal text-gray-400">Occupation / Job / Education</span>
              </label>
              <input type="text" placeholder="ఉదా: రైతు, ఉపాధ్యాయుడు, విద్యార్థి..." maxLength={200} {...field('occupationOrEducation')} />
            </div>

            {/* Aadhaar */}
            <div>
              <label className="label-field text-xs">
                ఆధార్ నంబర్ <span className="text-red-500">*</span>
                <span className="block font-normal text-gray-400">Aadhaar Number</span>
              </label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                inputMode="numeric"
                value={formatAadhaar(member.aadhaarNo)}
                onChange={(e) => onChange(index, 'aadhaarNo', e.target.value.replace(/\D/g, '').slice(0, 12))}
                className={`input-field text-sm py-2 tracking-widest ${err('aadhaarNo') ? 'input-error' : ''}`}
              />
              {err('aadhaarNo') && <p className="text-red-500 text-xs mt-1">{err('aadhaarNo')}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="label-field text-xs">
                సెల్ నంబర్ <span className="text-gray-400 font-normal">(ఐచ్ఛికం)</span>
                <span className="block font-normal text-gray-400">Mobile Number</span>
              </label>
              <input
                type="tel"
                placeholder="XXXXX XXXXX"
                maxLength={11}
                inputMode="numeric"
                value={formatMobile(member.mobileNo)}
                onChange={(e) => onChange(index, 'mobileNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`input-field text-sm py-2 tracking-widest ${err('mobileNo') ? 'input-error' : ''}`}
              />
              {err('mobileNo') && <p className="text-red-500 text-xs mt-1">{err('mobileNo')}</p>}
            </div>
          </div>

          {/* ── Welfare Schemes (Yes/No + conditional reason) ── */}
          <div className={`rounded-xl border p-3 ${err('welfareSchemes') || err('welfareReason') ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="text-xs font-semibold text-gray-700 leading-tight mb-0.5">
              సంక్షేమ పథకాలు వస్తున్నాయా? <span className="text-red-500">*</span>
            </div>
            <div className="text-[10px] text-gray-400 mb-2 leading-tight">Receiving Welfare Schemes?</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'వస్తుంది', te: 'వస్తుంది', en: 'Yes' },
                { value: 'లేదు',     te: 'లేదు',     en: 'No'  },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(index, 'welfareSchemes', opt.value)}
                  className={`flex flex-col items-center px-3 py-2 rounded-lg font-medium transition-all min-h-[44px] min-w-[60px] ${
                    member.welfareSchemes === opt.value
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <span className="text-xs leading-tight">{opt.te}</span>
                  <span className={`text-[10px] leading-tight ${member.welfareSchemes === opt.value ? 'text-primary-200' : 'text-gray-400'}`}>{opt.en}</span>
                </button>
              ))}
            </div>
            {err('welfareSchemes') && <p className="text-red-500 text-xs mt-1">{err('welfareSchemes')}</p>}
          </div>

          {/* ── Yes/No Toggles ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {YES_NO_FIELDS.filter((f) => !f.headOnly || isHead).map(({ key, label, labelEn, required, options }) => (
              <div
                key={key}
                className={`rounded-xl p-3 ${err(key) ? 'border border-red-300 bg-red-50' : 'bg-gray-50'}`}
              >
                <div className="text-xs font-semibold text-gray-700 leading-tight">
                  {label} {required && <span className="text-red-500">*</span>}
                </div>
                <div className="text-[10px] text-gray-400 mb-2 leading-tight">{labelEn}</div>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleToggle(key, opt.value, required)}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg font-medium transition-all min-h-[44px] min-w-[60px] ${
                        member[key] === opt.value
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-xs leading-tight">{opt.te}</span>
                      <span className={`text-[10px] leading-tight ${member[key] === opt.value ? 'text-primary-200' : 'text-gray-400'}`}>
                        {opt.en}
                      </span>
                    </button>
                  ))}
                </div>
                {err(key) && <p className="text-red-500 text-xs mt-1">{err(key)}</p>}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
