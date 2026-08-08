# MailQuill

AI that drafts email replies from **thread history** (or a generic professional reply).

## Easiest route to something that works

| Step | Time | What |
|------|------|------|
| 1 | 10 min | Install [Ollama](https://ollama.com) → `ollama pull llama3.2` |
| 2 | 1 min | `cd saas/mailquill && npm start` |
| 3 | 1 min | `npm run demo` or `POST /v1/reply` |

**Why Ollama first?** Free, private, OpenAI-compatible (`http://localhost:11434/v1`), no card.  
Swap to OpenAI/Groq/OpenRouter later by changing `MAILQUILL_BASE_URL` + `MAILQUILL_API_KEY` — same code.

## API

```bash
curl -s -X POST http://localhost:8791/v1/reply \
  -H "Authorization: Bearer mq_test_demo" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "thread",
    "tone": "friendly_professional",
    "goal": "answer their question and offer a call",
    "thread": [
      {"from":"client@x.com","to":"me@shop.com","subject":"Order delay?","body":"Hi, any update on order 42?"},
      {"from":"me@shop.com","to":"client@x.com","body":"Checking with the maker today."}
    ]
  }'
```

Modes:

- `thread` — uses historic messages  
- `generic` — first-touch / no history  
- `short` — 2–3 sentence reply  

## Env

```env
MAILQUILL_PORT=8791
MAILQUILL_BASE_URL=http://127.0.0.1:11434/v1   # Ollama
MAILQUILL_API_KEY=ollama
MAILQUILL_MODEL=llama3.2
# Or cloud:
# MAILQUILL_BASE_URL=https://api.openai.com/v1
# MAILQUILL_API_KEY=sk-...
# MAILQUILL_MODEL=gpt-4o-mini
```

## Monetization (later)

- Free: 20 drafts/day  
- Pro: $12–19/seat/mo unlimited + saved tones  
- Team: shared templates + CRM webhook  
- Privacy pitch: “runs on your laptop / your VPS” with Ollama  

## Gmail later

OAuth → read last N messages → draft → user hits Send (never auto-send v1).
