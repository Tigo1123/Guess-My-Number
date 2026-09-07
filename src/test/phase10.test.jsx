import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen, fireEvent } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { usePlayerProfiles } from '../hooks/usePlayerProfiles';
import {
  loadProfilesFromStorage,
  sanitizeProfilesPayload,
  validateProfileName,
  PROFILES_STORAGE_KEY,
} from '../utils/profileStorage';
import { exportProgressBackup, validateBackupJSON } from '../utils/progressBackup';
import { ProfileManager } from '../components/ProfileManager';
import { LocalLeaderboard } from '../components/LocalLeaderboard';
import { ProgressBackupControls } from '../components/ProgressBackupControls';

describe('Phase 10 — Player Profiles, Leaderboard & Progress Backup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('1. Profile Creation, Switching, Renaming & Deletion', () => {
    it('automatically creates a default profile on initial load', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.profiles).toHaveLength(1);
      expect(result.current.activeProfile.name).toBe('Player 1');
    });

    it('creates new profile with valid trimmed 1-20 character name', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        const res = result.current.createProfile('  Alice  ');
        expect(res.success).toBe(true);
      });

      expect(result.current.profiles).toHaveLength(2);
      expect(result.current.activeProfile.name).toBe('Alice');
    });

    it('rejects blank or empty name with validation error', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        const res = result.current.createProfile('   ');
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/cannot be empty/i);
      });

      expect(result.current.profiles).toHaveLength(1);
    });

    it('rejects duplicate profile name case-insensitively', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.createProfile('Bob');
      });

      act(() => {
        const res = result.current.createProfile('bOb');
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/already exists/i);
      });

      expect(result.current.profiles).toHaveLength(2);
    });

    it('renames active profile cleanly', () => {
      const { result } = renderHook(() => useGameState());
      const activeId = result.current.activeProfileId;

      act(() => {
        const res = result.current.renameProfile(activeId, 'Taj');
        expect(res.success).toBe(true);
      });

      expect(result.current.activeProfile.name).toBe('Taj');
    });

    it('cannot delete the final remaining profile', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        const res = result.current.deleteProfile(result.current.activeProfileId);
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/final remaining profile/i);
      });

      expect(result.current.profiles).toHaveLength(1);
    });

    it('deleting active profile automatically switches to another profile', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.createProfile('Bob');
      });

      const bobId = result.current.activeProfileId;
      expect(result.current.activeProfile.name).toBe('Bob');

      act(() => {
        const res = result.current.deleteProfile(bobId);
        expect(res.success).toBe(true);
      });

      expect(result.current.profiles).toHaveLength(1);
      expect(result.current.activeProfile.name).toBe('Player 1');
    });

    it('switching profile starts a clean game round', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.createProfile('Player 2');
      });
      act(() => {
        const wrong = result.current.secretNumber === 1 ? 2 : 1;
        result.current.makeGuess(wrong);
      });

      expect(result.current.attempts).toBe(1);

      const p1Id = result.current.profiles[0].id;
      act(() => {
        result.current.switchProfile(p1Id);
      });

      expect(result.current.attempts).toBe(0);
      expect(result.current.status).toBe('PLAYING');
    });
  });

  describe('2. Legacy Progress Migration', () => {
    it('migrates legacy high scores, statistics, streak, best attempts, achievements to default profile', () => {
      localStorage.setItem('guess_my_number_highscores', JSON.stringify({ easy: 15, medium: 10, hard: 5 }));
      localStorage.setItem('guess_my_number_statistics', JSON.stringify({ totalGames: 3, totalWins: 2, totalLosses: 1, totalValidGuesses: 10, byDifficulty: { easy: { games: 3, wins: 2, losses: 1 }, medium: { games: 0, wins: 0, losses: 0 }, hard: { games: 0, wins: 0, losses: 0 } } }));
      localStorage.setItem('guess_my_number_achievements', JSON.stringify(['FIRST_WIN']));

      const { result } = renderHook(() => useGameState());

      expect(result.current.highScore).toBe(15);
      expect(result.current.statistics.totalGames).toBe(3);
      expect(result.current.statistics.totalWins).toBe(2);
      expect(result.current.achievements).toContain('FIRST_WIN');
    });

    it('migration is idempotent on repeat loads', () => {
      localStorage.setItem('guess_my_number_highscores', JSON.stringify({ easy: 12, medium: 0, hard: 0 }));
      const loaded1 = loadProfilesFromStorage();
      const loaded2 = loadProfilesFromStorage();

      expect(loaded1.profiles).toHaveLength(1);
      expect(loaded2.profiles).toHaveLength(1);
      expect(loaded2.profiles[0].progress.highScores.easy).toBe(12);
    });
  });

  describe('3. Profile Data Isolation', () => {
    it('keeps Player A and Player B statistics and achievements completely isolated', () => {
      const { result } = renderHook(() => useGameState());

      // Player A wins a game
      act(() => {
        result.current.makeGuess(result.current.secretNumber);
      });

      expect(result.current.statistics.totalWins).toBe(1);
      expect(result.current.achievements).toContain('FIRST_WIN');

      // Create & Switch to Player B
      act(() => {
        result.current.createProfile('Player B');
      });

      expect(result.current.statistics.totalWins).toBe(0);
      expect(result.current.achievements).toEqual([]);

      // Switch back to Player A
      const playerAId = result.current.profiles[0].id;
      act(() => {
        result.current.switchProfile(playerAId);
      });

      expect(result.current.statistics.totalWins).toBe(1);
      expect(result.current.achievements).toContain('FIRST_WIN');
    });
  });

  describe('4. Local Leaderboard Ranking Strategy', () => {
    it('ranks players by Total Wins desc, then Win Rate desc, then Best Streak desc', () => {
      const p1 = {
        id: 'p1',
        name: 'Alpha',
        progress: {
          statistics: { totalGames: 10, totalWins: 5, byDifficulty: {} },
          streak: { bestStreak: 2 },
          achievements: ['FIRST_WIN'],
        },
      };

      const p2 = {
        id: 'p2',
        name: 'Beta',
        progress: {
          statistics: { totalGames: 5, totalWins: 5, byDifficulty: {} }, // Higher win rate!
          streak: { bestStreak: 3 },
          achievements: [],
        },
      };

      render(<LocalLeaderboard profiles={[p1, p2]} activeProfileId="p1" />);

      const rows = screen.getAllByRole('row');
      // Index 0 is table header, Index 1 is Rank 1, Index 2 is Rank 2
      expect(rows[1]).toHaveTextContent('Beta');
      expect(rows[2]).toHaveTextContent('Alpha');
    });

    it('includes zero-game profiles in leaderboard and identifies active player accessibly', () => {
      const p1 = { id: 'p1', name: 'ActiveZero', progress: {} };
      render(<LocalLeaderboard profiles={[p1]} activeProfileId="p1" />);

      expect(screen.getByText('ActiveZero')).toBeInTheDocument();
      expect(screen.getByLabelText(/Active Player/i)).toBeInTheDocument();
    });
  });

  describe('5. Export & Import Progress Backup', () => {
    it('exports progress backup with valid metadata and all profiles', () => {
      const data = {
        version: 1,
        activeProfileId: 'p1',
        profiles: [{ id: 'p1', name: 'Taj', progress: {} }],
      };

      const backup = exportProgressBackup(data, true);
      expect(backup.app).toBe('guess-my-number');
      expect(backup.version).toBe(1);
      expect(backup.profiles).toHaveLength(1);
      expect(backup.soundPreference).toBe(true);
    });

    it('rejects malformed or invalid backup JSON', () => {
      expect(validateBackupJSON('invalid json').valid).toBe(false);
      expect(validateBackupJSON({ app: 'wrong-app', version: 1, profiles: [] }).valid).toBe(false);
      expect(validateBackupJSON({ app: 'guess-my-number', version: 99, profiles: [] }).valid).toBe(false);
    });

    it('accepts valid backup JSON payload', () => {
      const valid = {
        app: 'guess-my-number',
        version: 1,
        activeProfileId: 'p1',
        profiles: [{ id: 'p1', name: 'ImportedPlayer', progress: {} }],
      };
      const res = validateBackupJSON(valid);
      expect(res.valid).toBe(true);
      expect(res.payload.profiles[0].name).toBe('ImportedPlayer');
    });
  });

  describe('6. Storage Sanitization & Safety', () => {
    it('repairs invalid activeProfileId and sanitizes malformed profiles', () => {
      const raw = {
        version: 1,
        activeProfileId: 'non-existent',
        profiles: [{ id: 'p1', name: '   ', progress: null }],
      };
      const sanitized = sanitizeProfilesPayload(raw);
      expect(sanitized.activeProfileId).toBe('p1');
      expect(sanitized.profiles[0].name).toBe('Player 1');
      expect(sanitized.profiles[0].progress.highScores).toBeDefined();
    });
  });

  describe('7. Accessibility Integration', () => {
    it('renders profile manager action controls with accessible labels', () => {
      render(
        <ProfileManager
          profiles={[{ id: 'p1', name: 'Taj' }]}
          activeProfileId="p1"
          activeProfile={{ id: 'p1', name: 'Taj' }}
          onCreateProfile={() => {}}
          onSwitchProfile={() => {}}
          onRenameProfile={() => {}}
          onDeleteProfile={() => {}}
        />
      );

      expect(screen.getByRole('button', { name: /Switch Player Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create New Player Profile/i })).toBeInTheDocument();
    });

    it('renders backup controls file input with accessible label', () => {
      render(
        <ProgressBackupControls
          onExportBackup={() => {}}
          onRestoreBackup={() => {}}
        />
      );

      expect(screen.getByLabelText(/Upload Progress Backup JSON file/i)).toBeInTheDocument();
    });
  });
});
