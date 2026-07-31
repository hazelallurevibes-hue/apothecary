import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  markOnboardingStep,
  onboardingProgress,
  autoDetectOnboarding,
  nextIncompleteStep,
  stepsForSeller,
  setSellerPath,
  getSellerPath,
  isIdStepSatisfied,
  offersServices,
  isLaunchFullyDone,
  readLaunchDoneLocal,
  writeLaunchDoneLocal,
  fetchVendorOnboarding,
  markLaunchComplete,
} from '../lib/onboardingApi';

export default function VendorOnboardingChecklist({
  vendorId,
  menuCount = 0,
  produceCount = 0,
  user = null,
  onStepsChange,
}) {
  const listingCount = (Number(menuCount) || 0) + (Number(produceCount) || 0);
  const [steps, setSteps] = useState({});
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [savingPath, setSavingPath] = useState(false);
  const [graduated, setGraduated] = useState(() =>
    readLaunchDoneLocal(vendorId, user?.email) || listingCount > 0,
  );

  const graduate = (merged) => {
    writeLaunchDoneLocal(vendorId, user?.email);
    setGraduated(true);
    if (merged) {
      setSteps(merged);
      onStepsChange?.(merged);
    }
  };

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Instant hide for returning sellers with inventory or local flag
        if (readLaunchDoneLocal(vendorId, user?.email) || listingCount > 0) {
          const done = await markLaunchComplete(vendorId, {
            first_listing: listingCount > 0,
            seller_path_value:
              menuCount > 0 && produceCount > 0
                ? 'both'
                : menuCount > 0
                  ? 'services'
                  : 'products',
          }).catch(async () => {
            const { steps: saved } = await fetchVendorOnboarding(vendorId);
            return { ...saved, launch_complete: true };
          });
          if (!cancelled) graduate(done);
          if (!cancelled) setLoading(false);
          return;
        }

        const detected = await autoDetectOnboarding(vendorId, {
          menuCount,
          produceCount,
          user,
        });
        if (cancelled) return;
        setSteps(detected);
        onStepsChange?.(detected);
        if (isLaunchFullyDone(detected, { listingCount })) {
          graduate(detected);
        }
      } catch (e) {
        console.warn('[checklist]', e);
        // Last resort: hide if they have listings even on error
        if (listingCount > 0) graduate({ launch_complete: true, first_listing: true });
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId, menuCount, produceCount, user?.email]);

  useEffect(() => {
    if (isLaunchFullyDone(steps, { listingCount }) || listingCount > 0) {
      writeLaunchDoneLocal(vendorId, user?.email);
      setGraduated(true);
    }
  }, [steps, vendorId, listingCount, user?.email]);

  if (graduated || listingCount > 0) return null;
  if (loading) return null;

  const visibleSteps = stepsForSeller(steps);
  const { done, total, percent } = onboardingProgress(steps);
  const complete = isLaunchFullyDone(steps, { listingCount });
  const next = nextIncompleteStep(steps);
  const path = getSellerPath(steps);
  const idStatus = steps.id_verification_status || (steps.id_verification ? 'done' : 'needed');

  if (complete) {
    writeLaunchDoneLocal(vendorId, user?.email);
    return null;
  }

  const stepDone = (step) => {
    if (step.id === 'id_verification') return isIdStepSatisfied(steps);
    return !!steps[step.id];
  };

  const dismissForever = async () => {
    const done = await markLaunchComplete(vendorId, {
      first_listing: listingCount > 0 || !!steps.first_listing,
      seller_path_value: steps.seller_path_value || 'products',
    });
    graduate(done);
  };

  const toggleStep = async (stepId, autoOnly) => {
    if (autoOnly) return;
    if (stepId === 'seller_path') return;
    const nextVal = !steps[stepId];
    const updated = await markOnboardingStep(vendorId, stepId, nextVal);
    setSteps(updated);
    onStepsChange?.(updated);
    if (isLaunchFullyDone(updated, { listingCount })) graduate(updated);
  };

  const choosePath = async (value) => {
    if (!vendorId || savingPath) return;
    setSavingPath(true);
    try {
      const updated = await setSellerPath(vendorId, value);
      const detected = await autoDetectOnboarding(vendorId, { menuCount, produceCount, user });
      const merged = { ...updated, ...detected, seller_path: true, seller_path_value: value };
      setSteps(merged);
      onStepsChange?.(merged);
      if (isLaunchFullyDone(merged, { listingCount })) graduate(merged);
    } catch (e) {
      console.warn(e);
    }
    setSavingPath(false);
  };

  return (
    <div
      id="seller-path"
      className="mb-8 rounded-3xl p-6 border-2 scroll-mt-24 bg-gradient-to-r from-amber-50 via-[#4a1942]/5 to-white border-amber-400 shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-bold text-xl">Vendor launch checklist</h2>
          <p className="text-sm text-gray-600">
            {done} of {total} complete —{' '}
            <span className="font-semibold text-amber-900">
              next: {next?.label || 'finish remaining steps'}
            </span>
          </p>
          {path && (
            <p className="text-[11px] text-gray-500 mt-1">
              Path:{' '}
              <strong>
                {path === 'products' ? 'Products only' : path === 'services' ? 'Services' : 'Products + services'}
              </strong>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold text-[#4a1942]">{percent}%</div>
          <button type="button" onClick={() => setCollapsed((c) => !c)} className="text-xs border px-3 py-1 rounded-2xl">
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
          <button
            type="button"
            onClick={dismissForever}
            className="text-xs font-semibold px-3 py-1.5 rounded-2xl border border-[#4a1942]/30 text-[#4a1942] bg-white"
            title="Hide this checklist permanently — you can still post listings anytime"
          >
            I&apos;m done — hide permanently
          </button>
        </div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden mb-4 border">
        <div className="h-full bg-[#4a1942] transition-all" style={{ width: `${percent}%` }} />
      </div>
      {!collapsed && (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleSteps.map((step, index) => {
            const checked = stepDone(step);
            const isNext = !checked && next?.id === step.id;
            return (
              <div
                key={step.id}
                id={`launch-step-${step.id}`}
                className={`flex gap-3 p-4 rounded-2xl border-2 bg-white transition ${
                  checked
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : isNext
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-300'
                      : 'border-gray-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    checked ? 'bg-emerald-600 text-white' : 'bg-[#4a1942] text-white'
                  }`}
                >
                  {checked ? '✓' : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm">
                    {step.label}
                    {step.id === 'id_verification' && idStatus === 'pending' && (
                      <span className="ml-2 text-[10px] font-bold uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                        Submitted
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                  {step.id === 'seller_path' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { v: 'products', l: 'Products only' },
                        { v: 'services', l: 'Services / sessions' },
                        { v: 'both', l: 'Both' },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          disabled={savingPath}
                          onClick={() => choosePath(opt.v)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                            path === opt.v
                              ? 'bg-[#4a1942] text-white border-[#4a1942]'
                              : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  )}
                  {!checked && step.id !== 'seller_path' && (
                    <Link to={step.path} className="text-xs font-bold mt-2 inline-block text-[#4a1942] underline">
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
