# Guess My Number — v1.0.0 Release Verification Checklist

This manual release checklist ensures all functional, responsive, accessibility, persistence, and build criteria are fully met prior to tagging the v1.0.0 release.

---

## 🎮 1. Functional Verification

- [x] **Classic Mode**: Unlimited attempts, starting score computes correctly per difficulty, score decreases per attempt/hint.
- [x] **Timed Mode**: Countdown timer functions properly, 5-second warning plays audio/visual cue, game ends in loss on expiry.
- [x] **Limited Attempts Mode**: Decrements attempt counter, ends in loss when attempts reach max limit.
- [x] **Daily Challenge**: Loads seed based on UTC date key, official daily attempt increments streak, practice replays available post-completion.
- [x] **Hint System**: Gives non-spoiler hints (even/odd, range bounds), deducts score, handles insufficient score state.
- [x] **Achievements**: Unlocks appropriate badges upon condition fulfillment, shows toast notifications.
- [x] **Player Profiles**: Create new profile, switch active profile, rename profile, delete profile (with confirmation).
- [x] **Local Leaderboard**: Ranks profiles accurately across overall and per-difficulty filters.
- [x] **Game History**: Displays completed games log, filters by category, opens step-by-step replay details modal.
- [x] **Replay Analysis Modal**: Displays guess sequence with distance calculation from secret number.
- [x] **Personal Records**: Computes best attempts, best scores, fastest timed win, and recent performance form (`W W L W`).
- [x] **Progress Backup**: JSON export generates valid download file; JSON import restores all profiles cleanly.
- [x] **Reset & Clear Actions**: Reset statistics and clear history prompt for confirmation and clear active profile data safely.

---

## 📱 2. Responsive Layout & Mobile Polish

- [x] **Desktop (> 1024px)**: Full multi-column card layout, centered terminal panel, zero page overflow.
- [x] **Tablet (600px - 1024px)**: Flexible grids collapse gracefully, navigation bar fits neatly.
- [x] **Mobile (< 600px)**: Navigation tabs wrap/stack, tables scroll horizontally inside `.table-responsive` containers, button touch targets meet 44px minimum height.

---

## ♿ 3. Accessibility & Keyboard Navigation

- [x] **Keyboard Navigation**: All interactive elements (tabs, difficulty buttons, mode buttons, inputs) reachable via `Tab`.
- [x] **Guess Form Submission**: `Enter` key submits guess when input is focused.
- [x] **Modal Dialog Shortcuts**: `Escape` key closes replay analysis and confirmation dialogs.
- [x] **ARIA Attributes**: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `aria-pressed`, `aria-invalid`, `role="status"`, `aria-live="polite"` present and correct.
- [x] **Visual Indicators**: Information is not communicated by color alone (text badges accompany win/loss indicators).

---

## 💾 4. Persistence & Storage Safety

- [x] **Page Reload**: Active state, current profile, statistics, and history persist across browser reloads.
- [x] **Profile Switching**: Progress remains strictly isolated between different player profiles.
- [x] **Legacy Migration**: Older `guess_my_number_` storage keys automatically migrate to profile structure without data loss.
- [x] **Malformed Storage Fallback**: Corrupted or invalid JSON data gracefully recovers with safe default structures.

---

## 🚀 5. Build, Tests & Release Metadata

- [x] **Automated Test Suite**: All Vitest test suites pass (`npm test -- --run`).
- [x] **Production Build**: `npm run build` succeeds cleanly without errors.
- [x] **Git Workspace**: `git diff --check` passes cleanly with zero whitespace/newline errors.
- [x] **Version Metadata**: `package.json` specifies `"version": "1.0.0"` and Settings tab displays `v1.0.0`.
- [x] **Documentation**: `README.md` updated with comprehensive features, tech stack, setup instructions, and privacy notice.
