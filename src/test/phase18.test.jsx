import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { App } from '../App';

function key(key, options = {}) { fireEvent.keyDown(window, { key, ...options }); }
function setup() { localStorage.clear(); vi.spyOn(Math, 'random').mockReturnValue(0); const result = render(<App />); return result; }

describe('Phase 18 keyboard shortcuts', () => {
  beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

  it('Enter submits a valid guess through the existing form flow', () => { setup(); const input = screen.getByRole('spinbutton', { name: /guess a number/i }); fireEvent.change(input, { target: { value: '1' } }); fireEvent.keyDown(input, { key: 'Enter' }); expect(screen.getByText(/Correct Number/)).toBeInTheDocument(); });
  it('R reuses new round reset behavior', () => { setup(); const input = screen.getByRole('spinbutton', { name: /guess a number/i }); fireEvent.change(input, { target: { value: '2' } }); key('r'); expect(screen.getByRole('spinbutton', { name: /guess a number/i })).toHaveValue(null); });
  it('H invokes the available hint action', () => { setup(); key('h'); expect(screen.getByText(/Hint:/)).toBeInTheDocument(); });
  it('H safely does nothing when the game is complete', () => { setup(); const input = screen.getByRole('spinbutton', { name: /guess a number/i }); fireEvent.change(input, { target: { value: '1' } }); fireEvent.keyDown(input, { key: 'Enter' }); expect(() => key('h')).not.toThrow(); expect(screen.getByText(/Correct Number/)).toBeInTheDocument(); });
  it.each([['1', 'Play'], ['2', 'Stats'], ['3', 'History'], ['4', 'Players'], ['5', 'Settings']])('%s navigates to %s', (shortcut, tab) => { setup(); key(shortcut); expect(screen.getByRole('tab', { name: tab, exact: true })).toHaveAttribute('aria-selected', 'true'); });
  it('number keys remain guess input values while the guess input is focused', () => { setup(); const input = screen.getByRole('spinbutton', { name: /guess a number/i }); fireEvent.change(input, { target: { value: '' } }); fireEvent.keyDown(input, { key: '2' }); expect(screen.getByRole('tab', { name: 'Play', exact: true })).toHaveAttribute('aria-selected', 'true'); });
  it('ignores R, H, and navigation keys in text inputs', () => { setup(); const input = document.createElement('input'); input.setAttribute('aria-label', 'temporary text'); document.body.appendChild(input); input.focus(); fireEvent.keyDown(input, { key: 'r' }); fireEvent.keyDown(input, { key: 'h' }); fireEvent.keyDown(input, { key: '2' }); expect(screen.getByRole('tab', { name: 'Play', exact: true })).toHaveAttribute('aria-selected', 'true'); input.remove(); });
  it('ignores shortcuts with browser modifiers', () => { setup(); key('2', { ctrlKey: true }); key('3', { metaKey: true }); key('4', { altKey: true }); expect(screen.getByRole('tab', { name: 'Play', exact: true })).toHaveAttribute('aria-selected', 'true'); });
  it('opens help with ?', () => { setup(); key('?'); expect(screen.getByRole('dialog', { name: /keyboard shortcuts/i })).toBeInTheDocument(); });
  it('Escape closes help', () => { setup(); key('?'); key('Escape'); expect(screen.queryByRole('dialog', { name: /keyboard shortcuts/i })).not.toBeInTheDocument(); });
  it('Settings View shortcuts opens the same help panel', () => { setup(); key('5'); fireEvent.click(screen.getByRole('button', { name: 'View shortcuts' })); expect(screen.getByRole('dialog')).toBeInTheDocument(); });
  it('help has dialog semantics, heading, and a visible close button', () => { setup(); key('?'); const dialog = screen.getByRole('dialog', { name: /keyboard shortcuts/i }); expect(dialog).toHaveAttribute('aria-modal', 'true'); expect(screen.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeInTheDocument(); expect(screen.getByRole('button', { name: /close keyboard shortcuts/i })).toBeInTheDocument(); });
  it('visible Close button closes help', () => { setup(); key('?'); fireEvent.click(screen.getByRole('button', { name: /close keyboard shortcuts/i })); expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); });
  it('does not duplicate actions on repeated keydown', () => { setup(); const input = screen.getByRole('spinbutton', { name: /guess a number/i }); fireEvent.change(input, { target: { value: '1' } }); fireEvent.keyDown(input, { key: 'Enter', repeat: true }); expect(screen.getByRole('tab', { name: 'Play', exact: true })).toHaveAttribute('aria-selected', 'true'); });
  it('does not crash when help is already open and ? repeats', () => { setup(); key('?'); expect(() => key('?')).not.toThrow(); expect(screen.getAllByRole('dialog')).toHaveLength(1); });
  it('restores focus after closing help', () => { setup(); const opener = screen.getByRole('tab', { name: 'Play', exact: true }); opener.focus(); key('?'); key('Escape'); expect(document.activeElement).toBe(opener); });
  it('cleans up the global listener on unmount', () => { const { unmount } = setup(); unmount(); expect(() => key('2')).not.toThrow(); cleanup(); });
  it('preserves theme attributes while shortcuts navigate', () => { setup(); key('5'); fireEvent.click(screen.getByRole('button', { name: /^Light/ })); key('2'); expect(document.documentElement.dataset.theme).toBe('light'); expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute('aria-selected', 'true'); });
  it('preserves PWA install controls while shortcut help is available', () => { setup(); key('5'); expect(screen.getByRole('region', { name: 'Install Application' })).toBeInTheDocument(); key('?'); expect(screen.getByRole('dialog')).toBeInTheDocument(); });
  it('does not navigate from a rename-like contenteditable element', () => { setup(); const editor = document.createElement('div'); editor.setAttribute('contenteditable', 'true'); editor.setAttribute('aria-label', 'rename'); document.body.appendChild(editor); editor.focus(); fireEvent.keyDown(editor, { key: '3' }); expect(screen.getByRole('tab', { name: 'Play', exact: true })).toHaveAttribute('aria-selected', 'true'); editor.remove(); });
});
