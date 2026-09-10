import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameStatusMessage } from '../components/GameStatusMessage';
import { ProximityIndicator } from '../components/ProximityIndicator';
import { AudioSettings } from '../components/AudioSettings';
import { getProximityLevel } from '../utils/proximity';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 21.1 guess feedback and audio controls', () => {
  it('renders clear directional Too High and Too Low cards', () => {
    const { rerender } = render(<GameStatusMessage message="📉 Too High" maxNumber={50} feedbackToken={1} />);
    expect(screen.getByRole('status')).toHaveTextContent('TOO HIGH');
    expect(screen.getByRole('status')).toHaveTextContent('Try a smaller number');
    expect(screen.getByRole('status')).toHaveTextContent('⬆️');
    rerender(<GameStatusMessage message="📈 Too Low" maxNumber={50} feedbackToken={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('TOO LOW');
    expect(screen.getByRole('status')).toHaveTextContent('Try a larger number');
    expect(screen.getByRole('status')).toHaveTextContent('⬇️');
  });
  it('replaces directional feedback with Correct and keeps proximity secondary', () => {
    const { rerender } = render(<GameStatusMessage message="📉 Too High" maxNumber={20} proximity={{ level: 'almost', direction: 'high', difference: 1 }} feedbackToken={1} />);
    render(<ProximityIndicator proximity="Warm" animationToken={1} />);
    expect(screen.getByText('Proximity: Warm')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('ALMOST!');
    expect(screen.getByRole('status')).toHaveTextContent('Just a little too high');
    rerender(<GameStatusMessage message="🎉 Correct Number!" maxNumber={20} proximity={null} feedbackToken={2} />);
    expect(screen.getByRole('status')).toHaveTextContent('CORRECT!');
    expect(screen.queryByText('TOO HIGH')).toBeNull();
  });
  it('keeps audio controls to an On/Off music toggle and separate effects toggle', () => {
    render(<AudioSettings musicEnabled={false} onToggleMusic={() => {}} soundEnabled onToggleSound={() => {}} />);
    expect(screen.getByRole('button', { name: /Background Music Off/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sound Effects On/i })).toBeInTheDocument();
    expect(screen.queryByRole('slider')).toBeNull();
  });
  it('does not expose media-session integration from the audio controls', () => {
    expect('mediaSession' in navigator).toBe(false);
  });
  it('keeps reduced-motion rules and a local bundled audio source', () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(fs.existsSync(path.resolve(process.cwd(), 'public/audio/ambient-loop.wav'))).toBe(true);
  });
});
