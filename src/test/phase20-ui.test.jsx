import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../App';

describe('Phase 20 engagement UI', () => {
  beforeEach(() => localStorage.clear());
  it('renders accessible audio controls and keeps music separate from effects', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(screen.getByRole('region', { name: 'Audio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Background Music Off/i })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('slider', { name: /Music volume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sound Effects/i })).toBeInTheDocument();
  });
  it('renders today missions and achievement progress on Stats', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Stats' }));
    expect(screen.getByRole('region', { name: "Today's Missions" })).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    expect(screen.getByRole('region', { name: 'Game Achievements' })).toBeInTheDocument();
  });
});
