# Guess My Number — React Number Guessing Game (v1.0.0)

A feature-rich, accessible, and responsive retro-terminal number guessing web application built with **React** and **Vite**.

---

## 🌟 Features

- **Retro Terminal Aesthetic**: Modern dark theme with vibrant neon highlights, clean typography, smooth transitions, and high visual contrast.
- **Multiple Difficulties**: Easy (1–20), Medium (1–50), and Hard (1–100) range levels with customized scoring and attempt limits.
- **Dynamic Game Modes**: Classic, Timed Challenge, Limited Attempts, and Daily Challenge.
- **Local Player Profiles**: Multi-profile system allowing multiple players to maintain isolated scores, streaks, records, and achievements on the same machine.
- **Analytics & History**: Per-profile game history logs, guess-by-guess replay analysis, personal records dashboard, and overall local leaderboard rankings.
- **Progress & Backup**: Defensive browser `localStorage` persistence with complete JSON backup export and import controls.
- **Accessibility & UX**: Keyboard-navigable tab interface, screen reader live regions (`role="status"`), focus management, and responsive layout across desktop, tablet, and mobile.
- **Error Reliability**: Lightweight React Error Boundary protecting against unexpected runtime exceptions.

---

## 🎯 Game Modes

1. **Classic Mode**: Standard number guessing where score is computed based on difficulty starting score minus guess penalties and hint costs.
2. **Timed Challenge**: Race against a countdown clock (Easy: 30s, Medium: 45s, Hard: 60s) with 5-second auditory and visual time warnings.
3. **Limited Attempts Mode**: Strict attempt limits (Easy: 5 max, Medium: 7 max, Hard: 10 max).
4. **Daily Challenge**: Shared global daily random seed. Offers one official daily attempt to build a daily win streak, followed by unlimited practice replays.

---

## 👤 Player Profiles

- **Profile Switching**: Seamlessly change active players without reloading.
- **Data Isolation**: High scores, statistics, win streaks, achievements, and game histories are scoped to each profile.
- **Profile CRUD**: Full inline support to create, switch, rename, and safely delete profiles with clear confirmation prompts.

---

## 📊 Analytics & Replay System

- **Game History**: Filterable completed games log (Wins, Losses, Difficulties, Modes) showing date, duration, score, and attempt counts.
- **Replay Analysis**: Step-by-step breakdown of every valid guess in a finished round, calculating exact distance and direction relative to the secret number.
- **Personal Records**: Track best scores, fewest attempts, fastest timed wins, highest win scores, and recent performance form (`W W L W`).
- **Local Leaderboard**: Compare profile rankings across overall win count, win rate percentage, and best streak.

---

## 💾 Progress & Backup Controls

- Progress automatically saves to `localStorage` under `guess_my_number_profiles`.
- Legacy single-player records from earlier versions are automatically migrated on startup.
- **JSON Export & Import**: Download a complete `.json` backup file of all profiles and restore progress at any time.

---

## 🛠️ Tech Stack

- **Core**: React 18, Vite 6, JavaScript (ES Modules)
- **Styling**: Vanilla CSS with CSS Variables and responsive flex/grid layouts
- **Testing**: Vitest, React Testing Library, JSDOM
- **CI/CD**: GitHub Actions workflow verifying tests and production builds on push/PR

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev
```

---

## 🧪 Testing

```bash
# Run automated Vitest suite once
npm test -- --run
```

---

## 📦 Production Build

```bash
# Create optimized production build in dist/
npm run build
```

---

## 📁 Project Structure

```text
guess_number/
├── .github/workflows/ci.yml   # GitHub Actions CI pipeline
├── public/                     # Static assets & icons
├── src/
│   ├── components/            # Focused UI components
│   ├── constants/             # App version & difficulty configs
│   ├── hooks/                 # Custom React hooks (gameState, sound, profiles)
│   ├── utils/                 # Storage, sanitization & backup helpers
│   ├── test/                  # Automated Vitest test suites (Phases 1–12)
│   ├── App.jsx                # Main 5-tab terminal layout
│   ├── index.css              # Centralized CSS design system
│   └── main.jsx               # Entry point with Error Boundary
├── index.html                 # App metadata & SVG favicon
├── RELEASE_CHECKLIST.md       # Pre-release manual verification matrix
├── package.json               # Dependencies and scripts (v1.0.0)
└── README.md                  # Project documentation
```

---

## 🔒 Data Privacy Statement

All application data—including profiles, game history, statistics, and settings—is stored **100% locally** within your web browser's `localStorage`. No personal information, telemetry, or analytics data is ever transmitted to external servers.

---

## 🔖 Release

- **Current Version**: `v1.0.0`
- **Repository**: [Tigo1123/Guess-My-Number](https://github.com/Tigo1123/Guess-My-Number)
