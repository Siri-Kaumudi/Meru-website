import { UserPlus } from 'lucide-react';
import MemberRow from './MemberRow';

const EMPTY_MEMBER = {
  surname: '', name: '', aadhaarNo: '', age: '', gender: '', relationshipWithHead: '',
  occupationOrEducation: '', ownHouse: '', welfareSchemes: '',
  maritalStatus: '', governmentPension: '', rationCard: '', freeUnits200: '',
  tailoringDependent: '', mobileNo: '',
};

export default function FormStep2({ members, onMemberChange, onAddMember, onRemoveMember, onAadhaarStatus, errors }) {
  return (
    <div className="animate-slide-up">
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
        <p className="text-primary-800 font-semibold text-sm">
          👨‍👩‍👧‍👦 కుటుంబ సభ్యుల వివరాలు / Family Members Details
        </p>
        <p className="text-primary-600 text-xs mt-1">
          మీ కుటుంబంలోని అందరి వివరాలు నమోదు చేయండి. గరిష్టంగా 8 సభ్యులు. మొదటి సభ్యుడు కుటుంబయజమాని.
        </p>
        <p className="text-primary-600 text-xs">Maximum 8 members. First member is the head of household.</p>
      </div>

      {/* Member count indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-600">
          మొత్తం సభ్యులు: <span className="text-primary-700 text-base">{members.length}</span> / 8
        </div>
        {members.length < 8 && (
          <button
            type="button"
            onClick={onAddMember}
            className="flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-sm px-4 py-2 rounded-xl border-2 border-primary-200 hover:border-primary-400 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            సభ్యుడిని జోడించు
          </button>
        )}
      </div>

      <div className="space-y-4">
        {members.map((member, i) => (
          <MemberRow
            key={i}
            member={member}
            index={i}
            onChange={onMemberChange}
            onRemove={onRemoveMember}
            onAadhaarStatus={onAadhaarStatus}
            errors={errors}
            canRemove={i > 0}
            isHead={i === 0}
          />
        ))}
      </div>

      {members.length < 8 && (
        <button
          type="button"
          onClick={onAddMember}
          className="w-full mt-4 py-3 border-2 border-dashed border-primary-300 rounded-2xl text-primary-600 font-semibold text-sm hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          మరొక సభ్యుడిని జోడించు (Add Another Member)
        </button>
      )}

      {members.length >= 8 && (
        <p className="text-center text-amber-600 text-sm mt-4 bg-amber-50 rounded-xl p-3">
          ⚠️ గరిష్ట సభ్యుల సంఖ్య (8) చేరుకున్నారు
        </p>
      )}
    </div>
  );
}

export { EMPTY_MEMBER };
