# Hazel / Apothecary — SaaS product lab

Each product is its **own project folder** under `saas/`.  
The marketplace (`frontend/`) **consumes** them via Vite aliases or HTTP APIs.

| Folder | Product | One-liner | Monetization (start) |
|--------|---------|-----------|----------------------|
| `tax-vato/` | **Tax Vato** | Worldwide multi-party tax quote API + embed | Free tier + paid API keys + marketplace fee % |
| `little-shippie/` | **Little Shippie** | Rate shop, labels, zones, multi-tenant shipping | Per label markup + shop subscription |
| `mailquill/` | **MailQuill** | AI email replies from thread history (Ollama/OpenAI) | Seat/month + usage |

Consumer apps (not pure SaaS packages):

- `../frontend` — Apothecary marketplace  
- `../magic` — Teaching Sanctum / funnels  

## Run

```bash
# Tax Vato
cd saas/tax-vato && npm test && npm start

# Little Shippie
cd saas/little-shippie && npm test && npm start

# MailQuill (needs Ollama OR OPENAI_API_KEY)
cd saas/mailquill && npm test && npm start
```

## Frontend aliases

```js
// frontend/vite.config.js
'@tax-vato'       → saas/tax-vato/src
'@little-shippie' → saas/little-shippie/src
```

## Adding a new SaaS

1. Create `saas/<name>/` with `package.json`, `src/`, `server/`, `test/`, `README.md`  
2. Keep **no** marketplace UI inside the package (HTTP + embed only)  
3. Wire apothecary only after the standalone demo works  
