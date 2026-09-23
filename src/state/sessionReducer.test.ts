import { describe, expect, it } from 'vitest';
import { SAMPLE_BILL } from '@/mocks/bills';
import { INITIAL_SESSION, hasAnalysis, sessionReducer, type SessionState } from './sessionReducer';

const FILE = { name: 'march-bill.pdf', size: 4096, type: 'application/pdf' };

function analyzed(): SessionState {
  let s = sessionReducer(INITIAL_SESSION, { type: 'UPLOAD_START', file: FILE });
  s = sessionReducer(s, { type: 'UPLOAD_COMPLETE' });
  s = sessionReducer(s, { type: 'ANALYZE_COMPLETE', bill: SAMPLE_BILL, usedSample: false });
  return s;
}

describe('upload lifecycle', () => {
  it('records the chosen file', () => {
    const s = sessionReducer(INITIAL_SESSION, { type: 'UPLOAD_START', file: FILE });
    expect(s.uploadStatus).toBe('uploading');
    expect(s.file?.name).toBe('march-bill.pdf');
  });

  it('clears the file and keeps the message on a rejection', () => {
    const s = sessionReducer(INITIAL_SESSION, { type: 'UPLOAD_ERROR', message: 'Not a PDF' });
    expect(s.uploadStatus).toBe('error');
    expect(s.file).toBeNull();
    expect(s.uploadError).toBe('Not a PDF');
  });

  it('produces an analysis', () => {
    expect(hasAnalysis(analyzed())).toBe(true);
  });
});

describe('RESET_ANALYSIS invalidates derived results', () => {
  it('clears the bill when the file is removed', () => {
    const s = sessionReducer(analyzed(), { type: 'RESET_ANALYSIS' });
    expect(s.bill).toBeNull();
    expect(s.file).toBeNull();
    expect(s.uploadStatus).toBe('empty');
    expect(hasAnalysis(s)).toBe(false);
  });

  it('clears the confirmation and the selected plan', () => {
    let s = sessionReducer(analyzed(), { type: 'CONFIRM_BILL' });
    s = sessionReducer(s, { type: 'SELECT_PLAN', planId: 'smart-home-12' });
    expect(s.billConfirmed).toBe(true);

    const reset = sessionReducer(s, { type: 'RESET_ANALYSIS' });
    expect(reset.billConfirmed).toBe(false);
    expect(reset.selectedPlanId).toBeNull();
  });

  it('keeps the profile, which is the user own input rather than a derived result', () => {
    let s = sessionReducer(analyzed(), { type: 'UPDATE_PROFILE', patch: { hasEv: true } });
    s = sessionReducer(s, { type: 'RESET_ANALYSIS' });
    expect(s.profile.hasEv).toBe(true);
  });
});

describe('bill edits', () => {
  it('replaces the bill without resetting the session', () => {
    const edited = { ...SAMPLE_BILL, usageKwh: 1600 };
    const s = sessionReducer(analyzed(), { type: 'EDIT_BILL', bill: edited });
    expect(s.bill?.usageKwh).toBe(1600);
    expect(hasAnalysis(s)).toBe(true);
  });
});

describe('profile answers persist', () => {
  it('merges patches rather than replacing the profile', () => {
    let s = sessionReducer(INITIAL_SESSION, { type: 'UPDATE_PROFILE', patch: { hasEv: true } });
    s = sessionReducer(s, { type: 'UPDATE_PROFILE', patch: { homeType: 'apartment' } });
    expect(s.profile.hasEv).toBe(true);
    expect(s.profile.homeType).toBe('apartment');
  });
});

describe('insights', () => {
  it('dismisses and restores', () => {
    let s = sessionReducer(INITIAL_SESSION, { type: 'DISMISS_INSIGHT', id: 'peak-shift' });
    expect(s.dismissedInsights).toContain('peak-shift');
    s = sessionReducer(s, { type: 'DISMISS_INSIGHT', id: 'peak-shift' });
    expect(s.dismissedInsights).toHaveLength(1);
    s = sessionReducer(s, { type: 'RESTORE_INSIGHT', id: 'peak-shift' });
    expect(s.dismissedInsights).toHaveLength(0);
  });
});
