import { CheckCircle, MapPin, Users, Home, User } from 'lucide-react';

function formatAadhaar(d) {
  return (d || '').replace(/(\d{4})(?=\d)/g, '$1 ');
}
function formatMobile(d) {
  return d && d.length > 5 ? d.slice(0, 5) + ' ' + d.slice(5) : (d || '');
}

function Row({ label, labelEn, value }) {
  if (!value && value !== 0) return null;
  return (
    <>
      <dt className="text-gray-500 text-xs leading-relaxed">
        {label}
        {labelEn && <span className="block text-[10px] text-gray-400">{labelEn}</span>}
      </dt>
      <dd className="text-gray-800 text-sm font-medium leading-relaxed break-words">{value}</dd>
    </>
  );
}

function Section({ icon: Icon, title, titleEn, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        {Icon && <Icon className="w-4 h-4 text-primary-600 flex-shrink-0" />}
        <span className="font-semibold text-primary-900 text-sm">{title}</span>
        {titleEn && <span className="text-gray-400 text-xs">· {titleEn}</span>}
      </div>
      <div className="px-4 py-3">
        {children}
      </div>
    </div>
  );
}

export default function FormStep3({ household, members }) {
  return (
    <div className="animate-slide-up space-y-4">

      {/* Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-green-800 font-semibold text-sm">నమోదు నిర్ధారణ · Confirm Registration</p>
          <p className="text-green-700 text-xs mt-0.5">
            దయచేసి అన్ని వివరాలు తనిఖీ చేయండి. మార్పులు అవసరమైతే వెనుకకు వెళ్ళండి.
          </p>
          <p className="text-green-600 text-xs">Review all details. Use Back to make changes.</p>
        </div>
      </div>

      {/* ── Household details ── */}
      <Section icon={MapPin} title="కుటుంబ వివరాలు" titleEn="Household Details">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <Row label="ఇంటి నంబర్"   labelEn="House No"     value={household.houseNo} />
          <Row label="వీధి / కాలనీ" labelEn="Street"       value={household.street} />
          <Row label="గ్రామం / నగరం"        labelEn="Village/City"   value={household.village} />
          <Row label="మండలం"               labelEn="Mandal"         value={household.mandal} />
          <Row label="డివిజన్ / వార్డ్ నెం." labelEn="Division/Ward" value={household.divisionWardNo} />
          <Row label="నియోజకవర్గం"          labelEn="Constituency"   value={household.constituency} />
          <Row label="జిల్లా"              labelEn="District"       value={household.district} />
          <Row label="రాష్ట్రం"      labelEn="State"        value={household.state || 'తెలంగాణ'} />
          {household.rationCardNo && <Row label="రేషన్ కార్డు నెం." labelEn="Ration Card No" value={household.rationCardNo} />}
          {household.nativePlace && <Row label="వలస కుటుంబం"      labelEn="Migrant Family" value="అవును · Yes" />}
          {household.nativePlace && <Row label="స్వగ్రామం"         labelEn="Native Place"   value={household.nativePlace} />}
        </dl>
      </Section>

      {/* ── Members ── */}
      <Section icon={Users} title={`కుటుంబ సభ్యులు (${members.length})`} titleEn="Family Members">
        <div className="space-y-4">
          {members.map((m, i) => (
            <div key={i} className={`rounded-xl border p-3 ${i === 0 ? 'border-primary-300 bg-primary-50' : 'border-gray-100 bg-gray-50'}`}>

              {/* Member header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-primary-700 text-white' : 'bg-gray-300 text-gray-700'}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-800 text-sm">
                    {[m.surname, m.name].filter(Boolean).join(' ')}
                  </span>
                  {i === 0 && (
                    <span className="ml-2 bg-primary-700 text-white text-[10px] px-2 py-0.5 rounded-full">యజమాని · Head</span>
                  )}
                </div>
              </div>

              {/* Member fields */}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                <Row label="లింగం"          labelEn="Gender"       value={m.gender} />
                <Row label="వయస్సు"         labelEn="Age"          value={m.age} />
                <Row label="సంబంధం"         labelEn="Relationship" value={m.relationshipWithHead} />
                {m.occupationOrEducation && <Row label="వృత్తి / చదువు" labelEn="Occupation" value={m.occupationOrEducation} />}
                <Row label="ఆధార్ నంబర్"   labelEn="Aadhaar"      value={formatAadhaar(m.aadhaarNo)} />
                {m.mobileNo && <Row label="సెల్ నంబర్"  labelEn="Mobile"  value={formatMobile(m.mobileNo)} />}
                <Row label="సంక్షేమ పథకాలు" labelEn="Welfare Schemes" value={m.welfareSchemes} />
                <Row label="వివాహ స్థితి"   labelEn="Marital Status"  value={m.maritalStatus} />
                {m.governmentPension && <Row label="ప్రభుత్వ పెన్షన్" labelEn="Govt Pension" value={m.governmentPension} />}
                {/* Head-only fields */}
                {i === 0 && <Row label="సొంత ఇల్లు"    labelEn="Own House"         value={m.ownHouse} />}
                {i === 0 && <Row label="రేషన్ కార్డు"  labelEn="Ration Card"       value={m.rationCard} />}
                {i === 0 && <Row label="ఉచిత కరెంటు"  labelEn="Free Current (200)" value={m.freeUnits200} />}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
        ⚠️ <strong>గమనిక:</strong> నమోదు చేసిన తర్వాత సవరించడం సాధ్యం కాదు. అన్ని వివరాలు సరిగ్గా ఉన్నాయని నిర్ధారించుకోండి.
        <span className="block text-amber-700 mt-0.5">Once submitted, changes cannot be made. Please verify all details above.</span>
      </div>

    </div>
  );
}
