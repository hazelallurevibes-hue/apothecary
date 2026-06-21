import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorContext } from '../lib/plans';
import {
  fetchVendorTaxSettings,
  saveVendorTaxSettings,
  fetchVendorOrdersForTax,
  saveTaxSnapshot,
  fetchTaxSnapshots,
} from '../lib/vendorTaxApi';
import {
  US_STATE_TAX_DEFAULTS,
  aggregateOrdersByQuarter,
  quarterlyReportToCsv,
  annual1099SummaryToCsv,
  quarterLabel,
  defaultRateForState,
  DEFAULT_PLATFORM_FEE_RATE,
} from '../lib/vendorTax';
import { downloadCsv } from '../lib/attestationsApi';

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_QUARTER = Math.floor(new Date().getMonth() / 3) + 1;

export default function VendorTaxCenter({ user }) {
  const ctx = getVendorContext(user);
  const vendorId = ctx?.vendorId;
  const [settings, setSettings] = useState({
    collect_sales_tax: false,
    sales_tax_rate: 6,
    tax_state: '',
    tax_county: '',
    platform_fee_rate: DEFAULT_PLATFORM_FEE_RATE,
    vendor_tax_id: '',
    tax_filing_name: '',
  });
  const [vendorName, setVendorName] = useState('');
  const [orders, setOrders] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [quarter, setQuarter] = useState(CURRENT_QUARTER);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;
    (async () => {
      setLoading(true);
      try {
        const [tax, orderRows, snaps] = await Promise.all([
          fetchVendorTaxSettings(vendorId),
          fetchVendorOrdersForTax(vendorId),
          fetchTaxSnapshots(vendorId),
        ]);
        if (tax) {
          setSettings({
            collect_sales_tax: !!tax.collect_sales_tax,
            sales_tax_rate: Number(tax.sales_tax_rate) || defaultRateForState(tax.tax_state),
            tax_state: tax.tax_state || '',
            tax_county: tax.tax_county || '',
            platform_fee_rate: Number(tax.platform_fee_rate) || DEFAULT_PLATFORM_FEE_RATE,
            vendor_tax_id: tax.vendor_tax_id || '',
            tax_filing_name: tax.tax_filing_name || tax.name || '',
          });
          setVendorName(tax.name || tax.tax_filing_name || '');
        }
        setOrders(orderRows);
        setSnapshots(snaps);
      } catch (e) {
        setMessage(e.message);
      }
      setLoading(false);
    })();
  }, [vendorId]);

  const quarterly = aggregateOrdersByQuarter(orders, year, quarter);

  const saveSettings = async () => {
    if (!vendorId) return;
    setSaving(true);
    setMessage('');
    try {
      await saveVendorTaxSettings(vendorId, settings);
      setMessage('Tax settings saved. New orders will use these rates.');
    } catch (e) {
      setMessage(e.message);
    }
    setSaving(false);
  };

  const generateQuarterly = async () => {
    if (!vendorId) return;
    try {
      await saveTaxSnapshot(vendorId, quarterly);
      const snaps = await fetchTaxSnapshots(vendorId);
      setSnapshots(snaps);
      downloadCsv(
        `Hazel Allure-tax-q${quarter}-${year}-vendor-${vendorId}.csv`,
        quarterlyReportToCsv(quarterly, settings.tax_filing_name || vendorName)
      );
      setMessage(`Quarterly estimate saved and downloaded for ${quarterLabel(year, quarter)}.`);
    } catch (e) {
      setMessage(e.message);
    }
  };

  const download1099 = () => {
    const csv = annual1099SummaryToCsv({
      vendor: { id: vendorId, name: vendorName, ...settings },
      year,
      orders,
    });
    downloadCsv(`Hazel Allure-payment-summary-${year}-vendor-${vendorId}.csv`, csv);
    setMessage(`Annual payment summary downloaded for ${year}. Share with your CPA — not an IRS filing.`);
  };

  if (!vendorId) {
    return <p className="text-gray-500">Vendor account required.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Tax &amp; SaaS fee center</h1>
      <p className="text-gray-600 mb-2">
        Collect sales tax at checkout, track Hazel Allure platform fees, and download quarterly estimates for your state and IRS planning.
      </p>
      <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-8">
        <strong>Not tax advice.</strong> Figures are estimates only. Hazel Allure does not file sales tax, income tax, or 1099-NEC forms on your behalf. Consult a licensed CPA or tax professional.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="bg-white border rounded-3xl p-6 sm:p-8 mb-8 space-y-4">
            <h2 className="font-semibold text-lg">Sales tax collection</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.collect_sales_tax}
                onChange={(e) => setSettings({ ...settings, collect_sales_tax: e.target.checked })}
              />
              Collect sales tax on customer checkout
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">State</label>
                <select
                  value={settings.tax_state}
                  onChange={(e) => {
                    const st = e.target.value;
                    setSettings({
                      ...settings,
                      tax_state: st,
                      sales_tax_rate: defaultRateForState(st),
                    });
                  }}
                  className="mt-1 w-full border p-3 rounded-2xl text-sm"
                >
                  <option value="">Select state</option>
                  {Object.keys(US_STATE_TAX_DEFAULTS).sort().map((st) => (
                    <option key={st} value={st}>{st} (base {US_STATE_TAX_DEFAULTS[st]}%)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Combined sales tax rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.sales_tax_rate}
                  onChange={(e) => setSettings({ ...settings, sales_tax_rate: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border p-3 rounded-2xl"
                />
                <p className="text-[10px] text-gray-400 mt-1">Include state + local rate you are registered to collect.</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">County / locality (optional)</label>
                <input
                  value={settings.tax_county}
                  onChange={(e) => setSettings({ ...settings, tax_county: e.target.value })}
                  className="mt-1 w-full border p-3 rounded-2xl"
                  placeholder="e.g. Travis County"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Hazel Allure platform SaaS fee (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.platform_fee_rate}
                  onChange={(e) => setSettings({ ...settings, platform_fee_rate: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border p-3 rounded-2xl"
                />
                <p className="text-[10px] text-gray-400 mt-1">Deducted from your gross sales (not charged to customers).</p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Legal / tax filing name</label>
                <input
                  value={settings.tax_filing_name}
                  onChange={(e) => setSettings({ ...settings, tax_filing_name: e.target.value })}
                  className="mt-1 w-full border p-3 rounded-2xl"
                  placeholder="Business or sole proprietor name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">EIN or SSN (last 4 ok for records)</label>
                <input
                  value={settings.vendor_tax_id}
                  onChange={(e) => setSettings({ ...settings, vendor_tax_id: e.target.value })}
                  className="mt-1 w-full border p-3 rounded-2xl"
                  placeholder="XX-XXXXXXX or ••••1234"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-3 bg-[#4a1942] text-white rounded-2xl text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save tax settings'}
            </button>
          </div>

          <div className="bg-white border rounded-3xl p-6 sm:p-8 mb-8">
            <h2 className="font-semibold text-lg mb-4">Quarterly estimates</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="border px-3 py-2 rounded-xl text-sm">
                {[CURRENT_YEAR, CURRENT_YEAR - 1].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))} className="border px-3 py-2 rounded-xl text-sm">
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>{quarterLabel(year, q)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-6">
              <Stat label="Orders" value={quarterly.orderCount} />
              <Stat label="Gross sales" value={`$${quarterly.grossSales.toFixed(2)}`} />
              <Stat label="Sales tax collected" value={`$${quarterly.salesTaxCollected.toFixed(2)}`} />
              <Stat label="Platform fees" value={`$${quarterly.platformFees.toFixed(2)}`} />
              <Stat label="Net earnings" value={`$${quarterly.netEarnings.toFixed(2)}`} />
              <Stat label="Est. total tax liability" value={`$${quarterly.estimatedTotalTaxLiability.toFixed(2)}`} accent />
            </div>

            <div className="text-xs text-gray-600 space-y-1 mb-4 bg-gray-50 rounded-2xl p-4">
              <p>Est. state sales tax to remit: <strong>${quarterly.estimatedStateTaxOwed.toFixed(2)}</strong></p>
              <p>Est. federal income tax (~22%): <strong>${quarterly.estimatedFederalIncomeTax.toFixed(2)}</strong></p>
              <p>Est. self-employment tax (~15.3%): <strong>${quarterly.estimatedSelfEmploymentTax.toFixed(2)}</strong></p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={generateQuarterly} className="px-5 py-2.5 bg-emerald-700 text-white rounded-2xl text-sm font-medium">
                Save &amp; download quarterly report
              </button>
              <button type="button" onClick={download1099} className="px-5 py-2.5 border rounded-2xl text-sm font-medium hover:bg-gray-50">
                Download {year} payment summary (1099-style)
              </button>
            </div>

            {snapshots.length > 0 && (
              <div className="mt-6 text-xs text-gray-500">
                <div className="font-medium text-gray-700 mb-2">Saved quarterly snapshots</div>
                {snapshots.slice(0, 8).map((s) => (
                  <div key={s.id} className="py-1 border-b last:border-0">
                    Q{s.quarter} {s.year} — gross ${Number(s.gross_sales).toFixed(2)} · generated {new Date(s.generated_at).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link to="/vendor-dashboard" className="text-sm text-[#4a1942] font-medium hover:underline">← Back to dashboard</Link>
        </>
      )}

      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`p-3 rounded-2xl ${accent ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}