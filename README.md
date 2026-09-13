# Graha Remedy App

A **free Vedic astrology application** that provides personalized spiritual remedies based on birth details and life problems — with **zero AI involved** in the output logic.

## What It Does

1. **User enters birth details** — date, time, and place of birth
2. **User selects life problems** from checkboxes and dropdowns — career, health, relationships, finances, education, etc.
3. **App returns personalized spiritual remedies** including:
   - **Mantras** — specific chant recommendations tied to planetary positions
   - **Fasting** — Vrat schedules aligned with planetary transits
   - **Donations** — Daan suggestions based on weak or malefic grahas
   - **Temple visits** — Recommended temples and worship rituals

All remedies are rule-based and drawn from classical Jyotish Shastra texts — no machine learning, no AI, no LLM calls. Pure deterministic lookup and matching.

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | Next.js + React + TypeScript |
| Backend   | Node.js + Express       |
| Data      | File-based JSON storage  |

## Project Structure

```
graha-remedy-app/
├── frontend/          # Next.js + React + TypeScript
│   ├── app/           # App Router pages and layout
│   ├── src/           # Components, API client, and shared types
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── backend/           # Node.js + Express
│   ├── src/
│   │   ├── index.ts         # Server entry point
│   │   ├── routes/          # API route handlers
│   │   └── middleware/      # Express middleware
│   ├── package.json
│   └── tsconfig.json
├── data/              # File-based JSON data layer
│   ├── planets/        # Planet (Graha) definitions
│   ├── remedies/       # Remedy catalog (mantras, vrat, daan, temples)
│   └── remedies_by_problem/  # Problem-to-remedy mapping rules
├── package.json       # Root scripts for running both services
└── README.md
```

## Getting Started

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in dev mode
npm run dev
```

- **Backend** runs on `http://localhost:3001`
- **Frontend** runs on `http://localhost:3000`

## Data Model

### Planets (`/data/planets`)
Each planet (Graha) has a definition including its Sanskrit name, ruling element, associated body parts, and the types of problems it governs when afflicted.

### Remedies (`/data/remedies`)
A catalog of spiritual remedies tagged by planet, problem category, and remedy type (mantra, fasting, donation, temple).

### Remedy Rules (`/data/remedies_by_problem`)
Mapping rules that connect a user's selected problems to the relevant planets and their remedies.

## Design Principles

- **No AI/ML** — All outputs are deterministic, rule-based lookups
- **Free forever** — No paywalls, no premium tiers
- **Culturally authentic** — Remedies sourced from Vedic/Jyotish tradition
- **Simple and accessible** — Works on low-bandwidth connections
- **Extensible** — New problems, planets, and remedies can be added via JSON files

## License

ISC
