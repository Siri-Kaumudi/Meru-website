import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StepIndicator from '../components/RegistrationForm/StepIndicator';
import FormStep1 from '../components/RegistrationForm/FormStep1';
import FormStep2, { EMPTY_MEMBER } from '../components/RegistrationForm/FormStep2';
import FormStep3 from '../components/RegistrationForm/FormStep3';
import { validateHousehold, validateAllMembers } from '../utils/validators';
import { registerHousehold } from '../utils/api';
import { ChevronRight, ChevronLeft, Send, Loader } from 'lucide-react';

const DRAFT_KEY = 'meru-registration-draft';

function saveDraft(step, household, members) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, household, members }));
  } catch {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object' || !d.household || !Array.isArray(d.members) || !d.members.length) return null;
    return d;
  } catch { return null; }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

function getInitialStep(draft) {
  try {
    const match = window.location.hash.match(/^#step-([123])$/);
    const hashStep = match ? parseInt(match[1], 10) : null;
    const savedStep = draft?.step || 1;
    // Only honour hash if it doesn't exceed the furthest step actually saved
    if (hashStep && hashStep <= savedStep) return hashStep;
    return savedStep;
  } catch { return 1; }
}

const INITIAL_HOUSEHOLD = {
  rationCardNo: '', clusterNo: '', houseNo: '', street: '', village: '', mandal: '',
  divisionWardNo: '', constituency: '', district: '', state: 'తెలంగాణ',
};

const HEAD_MEMBER = { ...EMPTY_MEMBER, relationshipWithHead: 'కుటుంబయజమాని' };

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    const d = loadDraft();
    return getInitialStep(d);
  });

  const [household, setHousehold] = useState(() => {
    const d = loadDraft();
    return d?.household || INITIAL_HOUSEHOLD;
  });

  const [members, setMembers] = useState(() => {
    const d = loadDraft();
    return d?.members?.length ? d.members : [{ ...HEAD_MEMBER }];
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  // per-member Aadhaar check status: { 0: 'available', 1: 'taken', ... }
  const [aadhaarStatuses, setAadhaarStatuses] = useState({});

  // Keep URL hash in sync with current step and scroll to top
  useEffect(() => {
    window.location.hash = `step-${step}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Persist draft to localStorage on every change
  useEffect(() => {
    saveDraft(step, household, members);
  }, [step, household, members]);

  function handleHouseholdChange(name, value) {
    setHousehold((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((e) => { const n = { ...e }; delete n[name]; return n; });
  }

  function handleMemberChange(index, key, value) {
    setMembers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
    const errKey = `member_${index}_${key}`;
    if (errors[errKey]) setErrors((e) => { const n = { ...e }; delete n[errKey]; return n; });
  }

  function handleAadhaarStatus(index, status) {
    setAadhaarStatuses((prev) => ({ ...prev, [index]: status }));
    // Clear any existing taken-error for this member when status changes
    const errKey = `member_${index}_aadhaarNo`;
    if (status !== 'taken' && errors[errKey]) {
      setErrors((e) => { const n = { ...e }; delete n[errKey]; return n; });
    }
  }

  function addMember() {
    if (members.length < 8) setMembers((prev) => [...prev, { ...EMPTY_MEMBER }]);
  }

  function removeMember(index) {
    if (index === 0) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (k.startsWith(`member_${index}_`)) delete next[k]; });
      return next;
    });
  }

  function validateStep1() {
    const errs = validateHousehold(household);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = validateAllMembers(members);

    // Inject errors for Aadhaar numbers that are already registered
    Object.entries(aadhaarStatuses).forEach(([idx, status]) => {
      if (status === 'taken') {
        errs[`member_${idx}_aadhaarNo`] = 'ఈ ఆధార్ నంబర్ ఇప్పటికే నమోదైంది / Already registered';
      }
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2) {
      // Block if any Aadhaar is still being checked
      const isChecking = Object.values(aadhaarStatuses).some((s) => s === 'checking');
      if (isChecking) {
        setServerError('ఆధార్ నంబర్ తనిఖీ పూర్తి కాలేదు. దయచేసి కొద్ది సేపు వేచి ఉండండి. / Aadhaar check in progress, please wait.');
        return;
      }
      setServerError('');
      if (validateStep2()) setStep(3);
    }
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
    setServerError('');
  }

  async function handleSubmit() {
    setSubmitting(true);
    setServerError('');
    try {
      const payload = {
        ...household,
        members: members.map((m, i) => ({
          ...m,
          slNo: i + 1,
          age: m.age !== '' ? Number(m.age) : undefined,
          relationshipWithHead: i === 0 ? 'కుటుంబయజమాని' : m.relationshipWithHead,
        })),
      };
      const res = await registerHousehold(payload);
      clearDraft();
      navigate('/success', { state: { memberCount: res.data.memberCount, householdId: res.data.householdId } });
    } catch (err) {
      const msg = err.response?.data?.message || 'నమోదు విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.';
      setServerError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-50 to-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary-900">కుటుంబ నమోదు</h1>
          <p className="text-gray-500 text-sm">Family Census Registration</p>
        </div>

        <StepIndicator currentStep={step} />

        {/* Draft restored notice */}
        {step > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mb-4 text-blue-700 text-xs flex items-center justify-between gap-3">
            <span>📋 మీ మునుపటి సమాచారం పునరుద్ధరించబడింది · Draft restored</span>
            <button
              type="button"
              onClick={() => { clearDraft(); setStep(1); setHousehold(INITIAL_HOUSEHOLD); setMembers([{ ...HEAD_MEMBER }]); setErrors({}); }}
              className="text-blue-500 hover:text-blue-700 underline text-xs flex-shrink-0"
            >
              క్లియర్ చేయండి
            </button>
          </div>
        )}

        {/* Server Error */}
        {serverError && (
          <div className="bg-red-50 border border-red-300 rounded-xl p-4 mb-5 text-red-700 text-sm animate-slide-up">
            ❌ {serverError}
          </div>
        )}

        {/* Validation error summary */}
        {errorCount > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5 text-amber-700 text-sm animate-slide-up">
            ⚠️ {errorCount} తప్పు(లు) కనుగొన్నారు. దయచేసి సరిచేయండి.
          </div>
        )}

        {/* Form Card */}
        <div className="card shadow-md">
          {step === 1 && (
            <FormStep1 data={household} onChange={handleHouseholdChange} errors={errors} />
          )}
          {step === 2 && (
            <FormStep2
              members={members}
              onMemberChange={handleMemberChange}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onAadhaarStatus={handleAadhaarStatus}
              errors={errors}
            />
          )}
          {step === 3 && (
            <FormStep3 household={household} members={members} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 gap-3">
          {step > 1 ? (
            <button type="button" onClick={handleBack} className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none justify-center">
              <ChevronLeft className="w-5 h-5" />
              వెనుకకు
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2 ml-auto flex-1 sm:flex-none justify-center">
              తదుపరి
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold flex items-center gap-2 ml-auto flex-1 sm:flex-none justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  నమోదు అవుతోంది...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  నమోదు చేయండి
                </>
              )}
            </button>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
