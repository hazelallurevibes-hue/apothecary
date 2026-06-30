import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  VENDOR_ONBOARDING_STEPS,
  markOnboardingStep,
  onboardingProgress,
  autoDetectOnboarding,
} from '../lib/onboardingApi';

export default function VendorOnboardingChecklist({ vendorId, menuCount = 0, produceCount = 0, user = null }) {
  const [steps, setSteps] = useState({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      setLoading(true);
      const detected = await autoDetectOnboarding(vendorId, { menuCount, produceCount, user });
      setSteps(detected);
      setLoading(false);
    })();
  }, [vendorId, menuCount, produceCount, user?.email]);

  const { done, total, percent } = onboardingProgress(steps);
  const complete = done >= total;

  const toggleStep = async (stepId, autoOnly) => {
    if (autoOnly) return;
    const next = !steps[stepId];
    const updated = await markOnboardingStep(vendorId, stepId, next);
    setSteps(updated);
  };

  if (loading) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-[#4a1942]/5 to-blue-50 border border-[#4a1942]/20 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-xl">Vendor launch checklist</h2>
          <p className="text-sm text-gray-600">
            {complete
              ? 'All launch steps complete — you are live!'
              : `${done} of ${total} complete — explore your dashboard anytime; finish in order before your first listing`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-[#4a1942]">{percent}%</div>
          <button type="button" onClick={() => setCollapsed((c) => !c)} className="text-xs border px-3 py-1 rounded-2xl">
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-4 border">
        <div className="h-full bg-[#4a1942] transition-all" style={{ width: `${percent}%` }} />
      </div>
      {!collapsed && (
        <div className="grid gap-3 sm:grid-cols-2">
          {VENDOR_ONBOARDING_STEPS.map((step, index) => {
            const checked = !!steps[step.id];
            return (
              <div
                key={step.id}
                className={`flex gap-3 p-4 rounded-2xl border bg-white ${checked ? 'border-emerald-300 bg-emerald-50/50' : ''}`}
              >
                {step.autoOnly ? (
                  <div
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      checked ? 'bg-emerald-600 text-white' : 'bg-[#4a1942] text-white'
                    }`}
                  >
                    {checked ? '✓' : index + 1}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id, step.autoOnly)}
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      checked ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                    aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {checked ? '✓' : index + 1}
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">
                    <span className="text-gray-400 mr-1">Step {index + 1}.</span>
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  {!checked && (
                    <Link to={step.path} className="text-xs text-[#4a1942] font-medium mt-2 inline-block hover:underline">
                      Go →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}