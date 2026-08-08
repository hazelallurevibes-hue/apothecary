# SaaS strategy — money, models, 10-year bets

## A. Current products → make money

### 1. Tax Vato (`saas/tax-vato`)
| Model | Price idea | Why it sells |
|-------|------------|--------------|
| API free tier | 100 quotes/day | Embed on any checkout |
| Pro API | $29–99/mo | Unlimited + multi-nexus |
| Marketplace cut | 0.1–0.3% of GMV tax line | Already on Hazel cart |
| White-label | $299+/mo | Other marketplaces |

**Working route (30 days):** public demo URL + Stripe billing for API keys + docs. Sell to Shopify/Woo stores that hate Avalara pricing.

### 2. Little Shippie (`saas/little-shippie`)
| Model | Price idea | Why it sells |
|-------|------------|--------------|
| Per label markup | $0.15–0.50 over postage | Default for makers |
| Shop Pro | $19/mo | Unlimited quotes + saved addresses |
| Platform license | $199/mo | Other marketplaces embed Shippie |

**Working route:** estimate mode live now → USPS/FedEx keys → charge markup on every label. eBay-style.

### 3. MailQuill (`saas/mailquill`)
| Model | Price idea | Why it sells |
|-------|------------|--------------|
| Free | 20 drafts/day local Ollama | Viral privacy angle |
| Pro seat | $12–19/mo | Cloud model + Gmail draft |
| Team | $49/mo | Shared tones + inbox |

**Working route (fastest SaaS to cash):**
1. Ollama local demo this week  
2. Chrome extension: “Draft with MailQuill” on Gmail  
3. Stripe subscription  
4. Optional cloud model for non-technical users  

---

## B. Easiest AI email path (decision)

```
Ollama (local) ──► MailQuill API ──► UI / Gmail later
       │
       └── swap base_url to OpenAI/Groq when ready
```

Do **not** start with fine-tuning. Prompt + last 12 emails is enough for v0.  
Never auto-send. Always human click Send.

---

## C. Optional next product ideas (viral / 10-year)

Think: **trust, time, money, health, climate, identity, AI agents.**

| Idea | Viral hook | 10-year need | Build difficulty |
|------|------------|--------------|------------------|
| **Life OS inbox** (MailQuill+) | “AI that knows every email you ever sent” | Personal agents with memory | Med |
| **Receipt → tax ready** (Tax Vato+) | Snap receipt, done | Everyone self-employed / creators | Med |
| **Ship carbon score** (Shippie+) | “Cheapest vs greenest label” | Climate-aware commerce | Easy bolt-on |
| **Local-first AI desk** | Privacy rebellion vs Big Tech | Data sovereignty | Med |
| **Skill passport** | Portable proof of courses/jobs | Career fluidity | Hard |
| **Care circle** | Family health logistics | Aging population | Hard |
| **Micro-trust escrow** | Peer services without Uber tax | Creator economy trust | Hard |
| **Neighborhood nodes** | Hyperlocal marketplace kit | Resilience / local supply | Med |
| **Agent marketplace policy** | Rules for AI that spends money | Agent economy | Hard — early |

**Pick for virality soon:** MailQuill Chrome extension + “draft without cloud” demo video.  
**Pick for world-changing money:** Tax Vato for global freelancers + Shippie for every indie seller.

---

## D. 90-day operating plan

| Week | Focus |
|------|--------|
| 1–2 | Shippie USPS/FedEx keys; Tax Vato public demo; MailQuill + Ollama demo |
| 3–4 | Billing (Stripe) for one product only — recommend **MailQuill Pro** or **Shippie Pro** |
| 5–8 | One distribution channel (Chrome Web Store or Indie Hackers + X) |
| 9–12 | Second product billing; case study from Hazel GMV |

Rule: **one paid customer path before building product #4.**
