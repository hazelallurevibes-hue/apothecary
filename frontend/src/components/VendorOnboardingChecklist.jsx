import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  VENDOR_ONBOARDING_STEPS,
  markOnboardingStep,
  onboardingProgress,
  autoDetectOnboarding,
  nextIncompleteStep,
} from '../lib/onboardingApi';

export default function VendorOnboardingChecklist({
  vendorId,
  menuCount = 0,
  produceCount = 0,
  user = null,
  onStepsChange,
}) {
  const [steps, setSteps] = useState({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      setLoading(true);
      const detected = await autoDetectOnboarding(vendorId, { menuCount, produceCount, user });
      setSteps(detected);
      onStepsChange?.(detected);
      setLoading(false);
    })();
  }, [vendorId, menuCount, produceCount, user?.email, user?.email_verified]);

  const { done, total, percent } = onboardingProgress(steps);
  const complete = done >= total;
  const next = nextIncompleteStep(steps);

  // Keep open when incomplete so the flashing step stays visible
  useEffect(() => {
    if (!complete) setCollapsed(false);
  }, [complete, next?.id]);

  const toggleStep = async (stepId, autoOnly) => {
    if (autoOnly) return;
    const nextVal = !steps[stepId];
    const updated = await markOnboardingStep(vendorId, stepId, nextVal);
    setSteps(updated);
    onStepsChange?.(updated);
  };

  if (loading) return null;

  return (
    <div
      className={`mb-8 rounded-3xl p-6 border-2 ${
        complete
          ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200'
          : 'bg-gradient-to-r from-amber-50 via-[#4a1942]/5 to-white border-amber-400 shadow-md'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-xl">Vendor launch checklist</h2>
          <p className="text-sm text-gray-600">
            {complete
              ? 'All launch steps complete — you are live!'
              : (
                <>
                  {done} of {total} complete —{' '}
                  <span className="font-semibold text-amber-900">
                    next: {next?.label || 'finish remaining steps'}
                  </span>
                </>
              )}
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
            const isNext = !checked && next?.id === step.id;
            const isBlockedEmail = !checked && step.id === 'verify_email';
            return (
              <div
                key={step.id}
                id={`launch-step-${step.id}`}
                className={`flex gap-3 p-4 rounded-2xl border-2 bg-white transition ${
                  checked
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : isNext || isBlockedEmail
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300 animate-pulse'
                      : 'border-gray-200'
                }`}
              >
                {step.autoOnly ? (
                  <div
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      checked
                        ? 'bg-emerald-600 text-white'
                        : isNext
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#4a1942] text-white'
                    }`}
                  >
                    {checked ? '✓' : index + 1}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleStep(step.id, step.autoOnly)}
                    className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                      checked
                        ? 'bg-emerald-600 text-white'
                        : isNext
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-100 text-gray-500'
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
                    {isNext && (
                      <span className="ml-2 text-[10px] font-black uppercase tracking-wide text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Do this now
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  {!checked && step.id === 'verify_email' && (
                    <p className="text-xs text-amber-950 bg-amber-100 border border-amber-300 rounded-xl px-2 py-1.5 mt-2 font-medium">
                      Email not confirmed yet. Check inbox + spam. Use the yellow banner Resend button — this step
                      stays highlighted until verified.
                    </p>
                  )}
                  {!checked && (
                    <Link
                      to={step.path}
                      className={`text-xs font-bold mt-2 inline-flex items-center gap-1 ${
                        isNext ? 'text-amber-900 underline' : 'text-[#4a1942] hover:underline'
                      }`}
                    >
                      {step.id === 'first_listing'
                        ? 'Open quick add →'
                        : step.id === 'verify_email'
                          ? 'Open verification page →'
                          : 'Go →'}
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
