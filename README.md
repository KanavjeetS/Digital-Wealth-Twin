# SecureWealth Twin 🛡️💰
**PSBs Hackathon 2026 — AI-Powered Digital Wealth Intelligence**

Premium dark dashboard with glowing widgets, liquid-glass UI, 3-agent AI system.

---

## 🚀 Quick Start (Local Dev — No Docker)

### Prerequisites
- Node.js 18+
- MongoDB running locally OR use Docker just for Mongo

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/securewealth-twin.git
cd securewealth-twin
npm run install:all
```

### 2. Set up environment
```bash
cp .env.example backend/.env
cp .env.example frontend/.env
# Edit backend/.env — set MONGO_URI, JWT_SECRET, API keys
```

### 3. Start MongoDB (via Docker, easiest)
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 4. Run full stack
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## 🐳 Docker Full Stack

```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up --build
# App: http://localhost:3000
```

---

## 🌐 ngrok (Expose AI service)

```bash
# If your Python FastAPI is on port 8000:
ngrok http 8000
# Copy the https URL → paste in backend/.env as AI_SERVICE_URL
```

---

## 🚀 Deploy to Vercel (Frontend)

### One-time setup in [Vercel](https://vercel.com/new)

1. **Import** your Git repo (e.g. [KanavjeetS/Digital-Wealth-Twin](https://github.com/KanavjeetS/Digital-Wealth-Twin)).
2. **Root Directory:** set to `frontend` (this repo is a monorepo: React app lives there).
3. **Framework:** Vercel should detect **Create React App**. Defaults are fine:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: `build`
4. **Environment variables** (Project → Settings → Environment Variables), for **Production** (and Preview if you want):

| Name | Example | Required |
|------|---------|----------|
| `REACT_APP_API_URL` | `https://your-api.railway.app` | **Yes** — your deployed Node/Express base URL **without** a trailing slash |

`REACT_APP_*` is inlined at **build** time; redeploy after changing it.

5. **CORS:** On the deployed backend, allow your Vercel origin (e.g. `https://your-app.vercel.app`) via `FRONTEND_URL` or expand `cors` `origin` in `backend/server.js` / env.

`frontend/vercel.json` adds SPA **rewrites** so React Router routes (e.g. `/dashboard`, `/coach`) work on refresh.

### Local production build check

```bash
cd frontend
set REACT_APP_API_URL=https://your-api.example.com
npm run build
npx serve -s build
```

### Backend (Railway / Render / Fly)

- Set all env vars from `.env.example` in the host dashboard (`MONGO_URI`, `JWT_SECRET`, etc.).
- Start command: `npm start` (from `backend/` root).
- Expose HTTPS URL → use that value for `REACT_APP_API_URL` on Vercel.

---

## 🔑 API Keys

Edit `backend/.env`:
```
OPENAI_API_KEY=sk-your-key      # For chatbot
ANTHROPIC_API_KEY=sk-ant-...    # Alternative
```

Leave blank → chatbot uses intelligent mock responses (works for demo).

---

## 📁 Structure
```
securewealth-twin/
├── frontend/          React + Tailwind (premium dark UI)
├── backend/           Node.js + Express + MongoDB
├── docker-compose.yml Full stack Docker
└── .env.example       All env vars documented
```

## 🤖 AI Agents
| Agent | Endpoint | What it does |
|-------|----------|-------------|
| Wealth Coach | POST /api/ai/chat | Personalized financial advice + Why? tooltip |
| Risk Engine | POST /api/risk/check | Cyber-fraud scoring: ALLOW/WARN/BLOCK |
| Simulator | POST /api/ai/simulate | Compound growth dual-line chart |
| Chatbot | POST /api/chat/message | GPT-4 powered conversational chat |
