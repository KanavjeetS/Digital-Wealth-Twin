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

```bash
cd frontend
npm run build
# Push to GitHub → connect repo in vercel.com → auto-deploy
```

For backend, deploy to Railway or Render:
- Set all env vars from .env in dashboard
- Set start command: `npm start`

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
