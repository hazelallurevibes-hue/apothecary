/**
 * Tax Vato embed widget — drop into any site:
 * <script src="https://yoursite.com/tax-vato/embed.js" data-api="https://api.yoursite.com" data-key="tv_test_…"></script>
 * <div id="tax-vato-widget" data-amount="49.99" data-country="US" data-region="NM"></div>
 */
(function () {
  var script = document.currentScript;
  var API = (script && script.getAttribute('data-api')) || '';
  var KEY = (script && script.getAttribute('data-key')) || '';

  function quote(payload) {
    if (!API) {
      return Promise.reject(new Error('data-api required on embed script'));
    }
    return fetch(API.replace(/\/$/, '') + '/v1/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: KEY ? 'Bearer ' + KEY : '',
      },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json();
    });
  }

  function render(el, data) {
    if (!data || !data.quote) {
      el.innerHTML = '<span style="color:#b91c1c">Tax Vato: ' + (data && data.error ? data.error : 'no quote') + '</span>';
      return;
    }
    var q = data.quote;
    el.innerHTML =
      '<div style="font-family:system-ui,sans-serif;border:1px solid #e5e7eb;border-radius:12px;padding:12px;max-width:320px">' +
      '<div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;font-weight:700">Tax Vato</div>' +
      '<div style="font-size:20px;font-weight:700;margin-top:4px">Tax $' +
      Number(q.taxTotal).toFixed(2) +
      '</div>' +
      '<div style="font-size:13px;color:#374151">Total $' +
      Number(q.total).toFixed(2) +
      ' · remitter: ' +
      ((q.remitter && q.remitter.remitter) || '—') +
      '</div>' +
      '<div style="font-size:10px;color:#9ca3af;margin-top:6px">Estimate only — not tax advice</div>' +
      '</div>';
  }

  function boot() {
    var nodes = document.querySelectorAll('[data-taxvato], #tax-vato-widget');
    nodes.forEach(function (el) {
      var amount = Number(el.getAttribute('data-amount') || el.dataset.amount || 0);
      var country = el.getAttribute('data-country') || 'US';
      var region = el.getAttribute('data-region') || '';
      quote({
        shipTo: { country: country, region: region },
        lines: [{ amount: amount, productCategory: el.getAttribute('data-category') || 'physical_goods' }],
      }).then(function (d) {
        render(el, d);
      }).catch(function (e) {
        el.textContent = 'Tax Vato error: ' + e.message;
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.TaxVato = { quote: quote };
})();
