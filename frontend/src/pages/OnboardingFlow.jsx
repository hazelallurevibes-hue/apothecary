import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  VENDOR_ONBOARDING_STEPS,
  autoDetectOnboarding,
  markOnboardingStep,
  onboardingProgress,
} from '../lib/onboardingApi';
import { getVendorContext } from '../lib/plans';
import { VERTICAL } from '../lib/vertical';

export default function OnboardingFlow({ user }) {
  const navigate = useNavigate();
  const vendorCtx = getVendorContext(user);
  const vendorId = vendorCtx?.vendorId || user?.vendor_id;
  const isVendor = user?.role === 'vendor' || !!vendorId;
  const [steps, setSteps] = useState({});
  const [loading, setLoading] = useState(!!vendorId);

  useEffect(() => {
    if (!vendorId) return;
    autoDetectOnboarding(vendorId, { user }).then((s) => {
      setSteps(s);
      setLoading(false);
    });
  }, [vendorId, user?.email]);

  const { done, total, percent } = onboardingProgress(steps);

  const toggleStep = async (stepId) => {
    if (!vendorId) return;
    const updated = await markOnboardingStep(vendorId, stepId, !steps[stepId]);
    setSteps(updated);
  };

  if (!isVendor) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-center">Welcome to Hazel Allure!</h1>
        <p className="text-center text-gray-600 mt-2">{VERTICAL.copy.seekerOnboardingTagline}</p>
        <div className="mt-10 bg-white border rounded-3xl p-8 space-y-4">
          <StepRow n={1} title="Wellness preferences" hint="Allergens, intentions, and what you avoid" to="/account-settings#wellness-prefs" />
          <StepRow n={2} title={VERTICAL.copy.seekerStepApothecary} hint={VERTICAL.copy.seekerStepApothecaryHint} to="/products" />
          <StepRow n={3} title={VERTICAL.copy.seekerStepServices} hint={VERTICAL.copy.seekerStepServicesHint} to="/services" />
          <button
            type="button"
            onClick={() => navigate('/account-settings#wellness-prefs')}
            className="mt-6 w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold"
          >
            Set up Wellness Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight text-center">Practitioner launch checklist</h1>
      <p className="text-center text-gray-600 mt-2">
        Complete these steps before seekers see your storefront at full strength.
      </p>

      <div className="mt-8 bg-white border rounded-3xl p-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium">{done} of {total} complete</span>
          <span className="text-sm font-bold text-[#4a1942]">{percent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
          <div className="h-full bg-[#4a1942]" style={{ width: `${percent}%` }} />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-4">
            {VENDOR_ONBOARDING_STEPS.map((step, i) => (
              <div key={step.id} className="flex gap-4 items-start p-4 rounded-2xl border">
                {step.autoOnly ? (
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                      steps[step.id] ? 'bg-emerald-600 text-white' : 'bg-[#4a1942] text-white'
                    }`}
                  >
                    {steps[step.id] ? '✓' : i + 1}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ${
                      steps[step.id] ? 'bg-emerald-600 text-white' : 'bg-[#4a1942] text-white'
                    }`}
                  >
                    {steps[step.id] ? '✓' : i + 1}
                  </button>
                )}
                <div className="flex-1">
                  <div className="font-medium">{step.label}</div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                  <Link to={step.path} className="text-sm text-[#4a1942] font-medium mt-2 inline-block hover:underline">
                    Open →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/vendor-dashboard')}
          className="mt-8 w-full py-3.5 bg-[#4a1942] text-white rounded-3xl font-semibold"
        >
          {percent >= 100 ? 'Go to dashboard' : 'Continue in dashboard'}
        </button>
      </div>
    </div>
  );
}

function StepRow({ n, title, hint, to }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-8 h-8 rounded-2xl bg-[#4a1942] text-white flex items-center justify-center font-bold flex-shrink-0">{n}</div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">{hint}</div>
      </div>
      <Link to={to} className="text-sm text-[#4a1942] font-medium">Go</Link>
    </div>
  );
}