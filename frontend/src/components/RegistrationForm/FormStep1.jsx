import { TELANGANA_DISTRICTS, DISTRICT_CONSTITUENCIES } from '../../utils/districts';

// Capitalise first letter of each word, but only for pure-English input
function toTitleCase(v) {
  return /[^\x00-\x7F]/.test(v) ? v : v.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export default function FormStep1({ data, onChange, errors }) {
  const field = (name) => ({
    value: data[name] || '',
    onChange: (e) => onChange(name, toTitleCase(e.target.value)),
    className: `input-field ${errors[name] ? 'input-error' : ''}`,
  });

  // When district changes, clear constituency
  const handleDistrictChange = (e) => {
    onChange('district', e.target.value);
    onChange('constituency', '');
  };

  const constituencies = data.district ? (DISTRICT_CONSTITUENCIES[data.district] || []) : [];

  return (
    <div className="animate-slide-up">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
        <p className="text-primary-800 font-semibold text-sm">
          🏠 కుటుంబ నమోదు వివరాలు / Household Registration Details
        </p>
        <p className="text-primary-600 text-xs mt-1">
          ఈ ఫారంలో మీ కుటుంబ వివరాలు నమోదు చేయండి. తరువాత సభ్యుల పేర్లు జోడించవచ్చు.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* House Number */}
        <div>
          <label className="label-field">
            ఇంటి నంబర్ / చిరునామా <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">House Number / Address</span>
          </label>
          <input type="text" placeholder="ఇంటి నంబర్" maxLength={50} {...field('houseNo')} />
          {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>}
        </div>

        {/* Street */}
        <div>
          <label className="label-field">
            వీధి / కాలనీ <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">Street / Colony</span>
          </label>
          <input type="text" placeholder="వీధి పేరు లేదా కాలనీ" maxLength={100} {...field('street')} />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
        </div>

        {/* Village */}
        <div>
          <label className="label-field">
            గ్రామం / నగరం <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">Village / Town / City</span>
          </label>
          <input type="text" placeholder="మీ గ్రామం లేదా నగరం పేరు" maxLength={100} {...field('village')} />
          {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
        </div>

        {/* Mandal */}
        <div>
          <label className="label-field">
            మండలం <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">Mandal</span>
          </label>
          <input type="text" placeholder="మండలం పేరు" maxLength={100} {...field('mandal')} />
          {errors.mandal && <p className="text-red-500 text-xs mt-1">{errors.mandal}</p>}
        </div>

        {/* Division / Ward No */}
        <div>
          <label className="label-field">
            డివిజన్ లేదా వార్డ్ నంబర్ <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">Division / Ward No.</span>
          </label>
          <input type="text" placeholder="డివిజన్ లేదా వార్డ్ నంబర్" maxLength={50} {...field('divisionWardNo')} />
          {errors.divisionWardNo && <p className="text-red-500 text-xs mt-1">{errors.divisionWardNo}</p>}
        </div>

        {/* District — select first, drives constituency */}
        <div>
          <label className="label-field">
            జిల్లా <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">District</span>
          </label>
          <select
            value={data.district || ''}
            onChange={handleDistrictChange}
            className={`input-field ${errors.district ? 'input-error' : ''}`}
          >
            <option value="">-- జిల్లా ఎంచుకోండి --</option>
            {TELANGANA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
        </div>

        {/* Constituency — dependent on district */}
        <div>
          <label className="label-field">
            నియోజకవర్గం <span className="text-red-500">*</span>
            <span className="block text-xs font-normal text-gray-400">Constituency</span>
          </label>
          <select
            value={data.constituency || ''}
            onChange={(e) => onChange('constituency', e.target.value)}
            disabled={!data.district}
            className={`input-field ${errors.constituency ? 'input-error' : ''} ${!data.district ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {data.district ? '-- నియోజకవర్గం ఎంచుకోండి --' : '-- ముందు జిల్లా ఎంచుకోండి --'}
            </option>
            {constituencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.constituency && <p className="text-red-500 text-xs mt-1">{errors.constituency}</p>}
        </div>

        {/* State */}
        <div>
          <label className="label-field">
            రాష్ట్రం
            <span className="block text-xs font-normal text-gray-400">State</span>
          </label>
          <input type="text" value="తెలంగాణ" readOnly className="input-field bg-gray-50 cursor-not-allowed" />
        </div>

        {/* Ration Card No */}
        <div>
          <label className="label-field">
            రేషన్ కార్డు నంబర్ <span className="text-gray-400 font-normal">(ఐచ్ఛికం)</span>
            <span className="block text-xs font-normal text-gray-400">Ration Card Number (Optional)</span>
          </label>
          <input type="text" placeholder="రేషన్ కార్డు నంబర్" maxLength={20} {...field('rationCardNo')} />
          {errors.rationCardNo && <p className="text-red-500 text-xs mt-1">{errors.rationCardNo}</p>}
        </div>

        {/* Native Place */}
        <div>
          <label className="label-field">
            స్వగ్రామం <span className="text-gray-400 font-normal">(ఐచ్ఛికం)</span>
            <span className="block text-xs font-normal text-gray-400">Native Place — if migrant family</span>
          </label>
          <input type="text" placeholder="స్వగ్రామం పేరు" maxLength={100} {...field('nativePlace')} />
          {errors.nativePlace && <p className="text-red-500 text-xs mt-1">{errors.nativePlace}</p>}
        </div>
      </div>
    </div>
  );
}
