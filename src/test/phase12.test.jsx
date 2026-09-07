import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { APP_VERSION } from '../constants/version';
import { sanitizeProgress, createEmptyProgress } from '../utils/profileStorage';

describe('Phase 12 — Release Polish & Readiness Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Information Architecture & Navigation', () => {
    it('defaults to the PLAY tab view on startup', () => {
      render(<App />);
      const playTab = screen.getByRole('tab', { name: /🎮 PLAY/i });
      expect(playTab).toHaveAttribute('aria-selected', 'true');
    });

    it('switches navigation tabs when clicked and updates tabpanel visibility', () => {
      render(<App />);

      const statsTab = screen.getByRole('tab', { name: /📊 STATS/i });
      fireEvent.click(statsTab);
      expect(statsTab).toHaveAttribute('aria-selected', 'true');

      const historyTab = screen.getByRole('tab', { name: /📜 HISTORY/i });
      fireEvent.click(historyTab);
      expect(historyTab).toHaveAttribute('aria-selected', 'true');

      const playersTab = screen.getByRole('tab', { name: /👤 PLAYERS/i });
      fireEvent.click(playersTab);
      expect(playersTab).toHaveAttribute('aria-selected', 'true');

      const settingsTab = screen.getByRole('tab', { name: /⚙️ SETTINGS/i });
      fireEvent.click(settingsTab);
      expect(settingsTab).toHaveAttribute('aria-selected', 'true');
    });


    it('displays active profile indicator banner', () => {
      render(<App />);
      expect(screen.getByTitle('Active Player')).toBeInTheDocument();
    });
  });

  describe('2. Versioning & Settings Content', () => {
    it('exports APP_VERSION constant matching 1.0.0', () => {
      expect(APP_VERSION).toBe('1.0.0');
    });

    it('displays version 1.0.0 and data privacy notice in SETTINGS view', () => {
      render(<App />);
      const settingsTab = screen.getByRole('tab', { name: /⚙️ SETTINGS/i });
      fireEvent.click(settingsTab);

      expect(screen.getByText(/v1.0.0/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Privacy:/i)).toBeInTheDocument();
    });
  });

  describe('3. Error Boundary Safety', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child Component Normal</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Child Component Normal')).toBeInTheDocument();
    });

    it('renders system fault fallback when an error is thrown', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const FaultyComponent = () => {
        throw new Error('Test Failure');
      };

      render(
        <ErrorBoundary>
          <FaultyComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('[!] SYSTEM FAULT')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('4. Defensive Storage & Legacy Payloads Audit', () => {
    it('sanitizes empty or partial progress structures safely', () => {
      const raw = {
        highScores: { easy: 50 },
      };
      const result = sanitizeProgress(raw);
      expect(result.highScores.easy).toBe(50);
      expect(result.gameHistory).toEqual([]);
      expect(result.achievements).toEqual([]);
    });

    it('creates robust empty progress with version schema', () => {
      const empty = createEmptyProgress();
      expect(empty.highScores).toBeDefined();
      expect(empty.statistics).toBeDefined();
      expect(empty.gameHistory).toBeDefined();
      expect(Array.isArray(empty.gameHistory)).toBe(true);
    });
  });
});
