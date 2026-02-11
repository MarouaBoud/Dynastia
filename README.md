# Dynastia

**A guided financial app that takes women from "scared to check my bank account" to financially confident, one week at a time.**

<p align="center">
  <img src="docs/hero.png" alt="Dynastia App" width="600">
</p>

## What is Dynastia?

Dynastia is a **Financial Journey OS** for women. Not another budgeting app.

Women earn, but don't invest. They know they "should" save more, but feel overwhelmed, behind, and paralyzed. Existing solutions are either education-only (no execution) or cold generic apps (no emotional design).

**We fix that** with a journey-first, decision-light financial system that:
- Tells you exactly what to do THIS week (one clear action)
- Adapts to your country (EU vs US tax rules)
- Speaks like a coach, not a bank statement
- Celebrates progress, not just tracks numbers


---

## Hero Feature: Money Date

A 10-minute weekly ritual that transforms your relationship with money.

```
Every Sunday:
1. Review last week's spending
2. Check progress on current goal
3. Approve next week's plan
4. Build your streak
```

Why it works: **Consistency over intensity**. 10 minutes weekly beats 2 hours monthly.

---

## The Sovereignty Ladder

Five tiers from "scared to open my banking app" to "I could quit my job tomorrow."

| Tier | Name | Goal |
|------|------|------|
| 1 | **Stabilize** | Understand cash flows, stop new debt |
| 2 | **Secure** | First €1,000 saved, emergency fund started |
| 3 | **Organize** | Sinking funds, bills on autopilot |
| 4 | **Grow** | Simple ETF investing set up |
| 5 | **Sovereign** | 12+ months runway, scenario planning |

Features unlock progressively. No overwhelm.

---

## Opik Integration

Every AI coaching interaction is traced, evaluated, and improved using Opik.

### What We Track

| Component | Purpose |
|-----------|---------|
| **Tracing** | Every LLM call logged with full context |
| **5 Custom Evaluators** | Measure coaching quality automatically |
| **LLM-as-Judge** | Automated scoring via Groq |
| **User Context** | Tier, milestone, country per trace |

### Custom Evaluators

```javascript
// Weighted composite score for every coaching response

Emotional Safety      30%  // No shame language, power phrases
One-Action Clarity    25%  // Exactly ONE doable action
Tier Alignment        20%  // Advice matches user's stage
Identity Building     15%  // Wealth mindset language
Overwhelm Prevention  10%  // Concise, focused responses
```

### Example: Emotional Safety Evaluator

```javascript
// Banned phrases (automatic score = 0)
const BANNED = ['you failed', "you're behind", 'you should have', 'just do', 'you must'];

// Power phrases (boost score)
const POWER = ['your next move', "you've got this", 'the data shows', "you're becoming"];
```

### Trace Metadata

Every trace includes:
- User ID, tier, current milestone, next milestone
- Country (for region-specific advice)
- Conversation type (money_date, coaching_chat, milestone_guidance)
- Token usage, latency, model name
- All 5 evaluation scores

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ HomeScreen  │  │ MoneyDate   │  │ Sovereignty     │ │
│  │ (Hero)      │  │ (Ritual)    │  │ Ladder          │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (NestJS)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Auth        │  │ Habits      │  │ Coaching        │ │
│  │ Service     │  │ Service     │  │ Service + Opik  │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    OPIK (Observability)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Trace       │  │ Experiments │  │ Evaluations     │ │
│  │ LLM Calls   │  │ A/B Tests   │  │ Quality Scores  │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Mobile** | Expo, React Native, TypeScript |
| **Backend** | NestJS, Prisma, PostgreSQL |
| **AI** | Groq (free tier - 14,400 req/day) |
| **Observability** | Opik SDK |
| **Auth** | JWT, 2FA, Biometrics |

---

## Country-Aware Rails

The app adapts to your financial reality.

| EU User Sees | US User Sees |
|--------------|--------------|
| Livret A, PEA | HYSA, Roth IRA, 401(k) |
| UCITS ETFs | Vanguard, Fidelity options |
| Euro-denominated advice | Dollar-denominated advice |

---

## Project Structure

```
Dynastia/
├── mobile/                    # Expo React Native app
│   ├── src/
│   │   ├── screens/          # HomeScreen, MoneyDate, etc.
│   │   ├── components/       # CoachPrompt, journey cards
│   │   ├── contexts/         # Auth, Habits, Coaching
│   │   └── navigation/       # RootNavigator
│   └── app.json
│
├── backend/                   # NestJS API
│   ├── src/
│   │   ├── services/
│   │   │   ├── opik/         # ⭐ Opik integration
│   │   │   │   ├── opik-client.ts
│   │   │   │   ├── tracing.ts
│   │   │   │   └── evaluators.ts
│   │   │   ├── coaching/     # Rule engine, prompt builder
│   │   │   └── llm/          # Groq client
│   │   └── controllers/
│   └── prisma/
│
├── presentation/             # Hackathon materials
│   ├── Dynastia-Hackathon-Presentation.pptx
│   └── PRESENTATION_SPEECH.md
│
└── docs/
    ├── PRD.md               # Full product requirements
    ├── SCREEN_AUDIT.md      # Screen simplification plan
    └── PRODUCT_UPDATE.md    # Current state summary
```

---

## Running the Project

### Prerequisites

- Node.js 18+
- PostgreSQL
- Expo CLI

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add your OPIK_API_KEY to .env
npx prisma migrate dev
npm run start:dev
```

### Environment Variables

```env
# Backend (.env)
DATABASE_URL="postgresql://..."
ACCESS_TOKEN_SECRET="..."
GROQ_API_KEY="..."          # Free tier available
OPIK_API_KEY="..."          # For tracing
OPIK_PROJECT="dynastia-coaching"
```

---

## Key Files for Judges

### Opik Integration

| File | Description |
|------|-------------|
| `backend/src/services/opik/opik-client.ts` | Singleton Opik client |
| `backend/src/services/opik/tracing.ts` | Traces coaching interactions |
| `backend/src/services/opik/evaluators.ts` | 5 custom evaluators + LLM-as-Judge |
| `backend/src/controllers/coaching.controller.ts` | Where tracing is called |

### User Journey

| File | Description |
|------|-------------|
| `mobile/src/screens/HomeScreen.tsx` | Hero dashboard with Money Date |
| `mobile/src/screens/habits/MoneyDateScreen.tsx` | Weekly ritual |
| `mobile/src/screens/milestones/SovereigntyLadderScreen.tsx` | Journey visualization |

---


---

## License

MIT

---

*From scared to sovereign.*
