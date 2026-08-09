# Investment decision framework (standard for every SaaS idea)

**Use this before corporate bank accounts, carrier certs, or months of build.**  
Last reviewed: 2026-08-09

---

## 1. Scorecard (fill for every idea)

| # | Question | Pass if… | Weight |
|---|----------|----------|--------|
| 1 | **Who pays?** Named buyer + budget already spent on this pain | Can name 10 companies | 15% |
| 2 | **Why us?** Unfair edge (data, distribution, vertical, brand) | Not “we code faster” | 15% |
| 3 | **Wedge vs giant** | Niche the big tools overcharge or ignore | 15% |
| 4 | **Time to first paid dollar** | ≤ 90 days with existing assets | 15% |
| 5 | **Capital at risk** | Cash + legal + compliance you can lose | 10% |
| 6 | **Ongoing ops burden** | Support, certs, rate tables, disputes | 10% |
| 7 | **Platform synergy** | Helps Hazel / Bpicius GMV or retention | 10% |
| 8 | **Downside if we stop** | Can we unplug and use a vendor? | 10% |

**Decision rules**

- **Build for our platforms only** if score is medium and synergy is high.  
- **Buy / integrate vendor (EasyPost, TaxJar, etc.)** if carrier/tax accuracy is core but sales distribution is not proven.  
- **Build standalone SaaS** only if wedge is clear **and** path to $5k+ MRR in 12–18 months is believable.  
- **Kill or pause** if capital/compliance >> near-term platform value.

---

## 2. Three paths (always compare)

| Path | Meaning | When it wins |
|------|---------|--------------|
| **A. Platform-only** | Feature inside Hazel/Bpicius; no separate go-to-market | Unblocks orders, keeps UX; no sales team |
| **B. Aggregator-backed product** | Our UI/brand; EasyPost/Shippo/TaxJar under the hood | Live postage/tax accuracy fast; we own markup + UX |
| **C. Full stack / direct carriers** | Direct USPS/UPS/FedEx + corporate banking + certs | High volume, negotiated rates, long-term moat, capital |

Most early winners: **A → B → optional C** once volume justifies C.

---

## 3. Little Shippie — market & ROI

### Market reality (research snapshot)

- Multi-carrier / shipping software is a **multi‑billion** category (reports often cite ~$3–16B+ depending on definition; growing ~10–13% CAGR).  
- Crowded: **ShipStation, Shippo, EasyPost, ShipEngine, Pirate Ship, AfterShip**, etc.  
- Buyers already pay:  
  - Shippo-class plans often **~$19–$199/mo** by volume.  
  - ShipStation free tier tiny; paid ~**$30+/mo** for real API access.  
  - EasyPost: low/zero monthly at low volume + **postage** + per-label platform fees after free tier (~**$0.08**/label after free allotment; pricing has tightened in 2026).  
- Direct carrier APIs (USPS/UPS/FedEx): **months of enrollment, corporate banking, certification**; EasyPost notes adding a second carrier direct can be **~3–4 months** of engineering vs one parameter with an aggregator.

### What “full USPS + UPS corporate path” really costs

| Cost bucket | Estimate (USD) | Time |
|-------------|----------------|------|
| Corporate checking / entity / KYC | $0–2k setup + banking time | 2–8 weeks |
| USPS Ship enrollment + payment rail | Low fee; high calendar time | 2–8 weeks |
| UPS developer + account linking | Low fee | 1–4 weeks |
| FedEx (optional) label certification | Low fee | +1–3 weeks |
| Engineering: live rates + labels + voids + webhooks + address validation | $15k–60k if hired; or 4–12 weeks full-time | 1–3 months |
| Support, disputes, bad labels, rate changes | Ongoing | Forever |
| **Year-1 cash outlay (solo/lean)** | **~$2k–15k hard costs** + **opportunity cost of 2–6 months focus** | — |
| **Year-1 to compete as “ShipStation for everyone”** | **$100k–500k+** (product, sales, support) | 12–24 months |

### Return scenarios (Shippie)

| Scenario | Labels / mo (all platforms) | Gross revenue model | Year-1 net (lean) |
|----------|-----------------------------|---------------------|-------------------|
| **A. Platform-only** | 50–500 (Hazel makers) | Better conversion; not separate ARR | **High ROI on UX**, low cash ARR |
| **B. UI + EasyPost/Shippo** | 200–2,000 | Markup $0.15–0.50/label + optional $19 Pro | **$5k–50k** if you sell; **$1k–10k** platform-only markup |
| **C. Direct carriers** | 5,000–50,000 | Lower postage cost + markup | Only worth it if volume is real |

**Honest verdict for Shippie**

| Question | Answer |
|----------|--------|
| Is there a market? | **Yes, huge** — but dominated. |
| Can we win as another EasyPost? | **No** without capital + sales machine. |
| Worth corporate banking + full USPS for **standalone SaaS now**? | **No** as primary bet. |
| Worth for **Hazel/Bpicius only**? | **Yes** for UX (rate shop, dims, print, tracking). |
| Best money path? | **Product UX (Shippie) + aggregator (EasyPost/Shippo/ShipEngine) for live postage** until you ship **thousands** of labels/month. |
| When open corporate + direct USPS/UPS? | When **your** platforms (or tenants) exceed ~**1–3k paid labels/month** or postage savings > EasyPost fees + your time. |

**Recommended Shippie strategy (maximize success)**

1. **Now:** Keep Shippie as **owned product** (rate shop, policies, multi-tenant API, vendor UX).  
2. **Live postage:** Integrate **one aggregator** (EasyPost or Shippo) behind Shippie — one key, USPS+UPS+FedEx without corporate USPS banking **first**.  
3. **Optional:** Finish UPS/USPS direct **later** as cost optimization, not as the go-live gate.  
4. **SaaS sales:** Only after Hazel makers love shipping (proof) — sell “Shippie white-label” to other marketplaces, still on aggregator.

---

## 4. Tax Vato — market & ROI

### Market reality

- Sales tax software market on the order of **~$8B → $18B** decade-scale (high-level reports; treat as directionally large).  
- Giants: **Avalara** (enterprise, opaque, often **$8k–$80k+/yr** all-in for mid-market), **TaxJar** (SMB, published ~**$19–$99+/mo** by order volume + filing fees).  
- Newer: Numeral, Anrok, Zamp — often **vertical** (SaaS tax, ecommerce).  
- Pain is real: marketplace facilitator rules, multi-state nexus, Canada GST/HST, Mexico IVA — **every multi-vendor platform needs a quote engine**.

### Build cost by ambition

| Ambition | What you build | Time | Money (lean) |
|----------|----------------|------|--------------|
| **A. Platform tax engine** | State + CA + MX rates, MPF, checkout (done path) | Ongoing polish | Mostly **engineering time already spent** |
| **B. Accurate US ZIP** | Certified provider or heavy SST/DOR feeds | 2–6 months | **$0–2k**/mo provider **or** large eng |
| **C. Standalone Tax SaaS** | Multi-tenant API, billing, filings, support | 6–18 months | **$30k–200k+** to compete seriously |
| **D. Filing product** | Returns, remittance, registrations | Hard / licensed | **High** legal + ops |

### Return scenarios (Tax Vato)

| Scenario | Customers | Pricing | Year-1 |
|----------|-----------|---------|--------|
| **A. Platform-only** | Hazel + Bpicius | Embedded in GMV / Pro | ROI = **fewer abandoned carts + correct remittance posture** |
| **B. API for similar marketplaces** | 5–20 platforms | $29–199/mo | **$2k–40k ARR** if sold |
| **C. Fight Avalara** | SMBs nationwide | TaxJar-like | Needs sales; low odds solo |

**Honest verdict for Tax Vato**

| Question | Answer |
|----------|--------|
| Is there a market? | **Yes**, compliance is permanent. |
| Can we beat Avalara/TaxJar as general tax SaaS? | **Not soon** without capital. |
| Worth deep rate tables + sources (what we did)? | **Yes** — required for **our** platforms and a credible API wedge. |
| Worth filing automation now? | **No** — partner or defer. |
| Best money path? | **Marketplace-native tax** (MPF + multi-party) for multi-vendor platforms like Hazel/Bpicius — underserved vs “Shopify brand → TaxJar”. |

**Recommended Tax Vato strategy**

1. **Primary:** Power Hazel + Bpicius checkout (US/CA/MX → expand).  
2. **Accuracy:** Keep sourced rates + validate quarterly; when volume grows, **optional TaxJar/Avalara calc API** behind same interface.  
3. **SaaS:** Sell to **other multi-vendor marketplaces** (not “every Shopify store”) — smaller beachhead.  
4. **Do not** open a full compliance firm (registrations + filing) until revenue funds specialists.

---

## 5. Side-by-side recommendation (today)

| Decision | Little Shippie | Tax Vato |
|----------|----------------|----------|
| **Corporate checking + full USPS now** | **Defer** until label volume proves ROI | N/A |
| **Best path 0–6 months** | **Shippie UX + EasyPost/Shippo** for live USPS/UPS | **Owned engine** + sourced rates (done); polish |
| **Build for platforms only** | **Yes** (must-have for fulfillment UX) | **Yes** (must-have for checkout) |
| **Stand-alone SaaS push** | After platform proof | After 1–2 external design partners |
| **Estimated cash to “good enough live”** | **$50–300/mo** aggregator + 1–3 weeks eng | **$0** extra if stay on owned rates; **$50–500/mo** if add certified calc |
| **Estimated time to significant SaaS ARR ($5k MRR)** | **12–24 months** + distribution | **12–24 months** + niche sales |
| **Risk if we over-invest in direct carriers** | High calendar + banking distraction | N/A |
| **Risk if we only use third parties** | Margin + dependency | Rate accuracy ceiling without provider |

### Bottom line (purposeful)

1. **Do not block Hazel on corporate USPS banking.** Use Shippie product + aggregator for live postage.  
2. **Keep building Shippie and Tax Vato as owned products** for your platforms — that investment already pays in conversion and operations.  
3. **Standalone SaaS is a phase-2 bet**, not the gate for going live.  
4. **Open corporate + direct USPS/UPS** when **label volume or rate savings** clearly beat aggregator cost + your months of focus.  
5. **Tax Vato** stay the course on **sourced NA rates**; don’t compete with Avalara on filing until you have demand and capital.

---

## 6. Template for the next idea (copy this)

```
Idea: _______________
Date: _______________

1. Buyer persona (who pays monthly):
2. Current spend / alternative:
3. Our unfair edge:
4. Path A platform-only — 90-day outcome:
5. Path B vendor-backed — monthly cost:
6. Path C full build — time/money/risk:
7. Year-1 ARR if things go well / poorly:
8. Kill criteria (when we stop):
9. Decision: A / B / C / kill
10. Owner + review date:
```

---

## 7. Suggested next 90 days (max success)

| Week | Shippie | Tax Vato |
|------|---------|----------|
| 1–2 | Pick EasyPost **or** Shippo; one API key; sandbox labels | Keep rates:validate; fix any Hazel quote bugs |
| 3–4 | Vendor “buy label” live in sandbox on Hazel | CA/MX checkout paths tested E2E |
| 5–8 | Production labels on real low-volume orders | Document MPF remittance process for ops |
| 9–12 | Measure labels/mo + markup; only then revisit direct USPS | Optional: 1 external marketplace pilot |

**Corporate bank account:** still useful for the **business overall** (Hazel/Bpicius), not a prerequisite to prove Shippie. When you open it, USPS enrollment becomes easier — treat it as **business legitimacy**, not a shipping-SaaS bet by itself.
