import { INITIAL_SESSION, type SessionState } from './sessionReducer';

const KEY = 'wattsai.session';
const VERSION = 1;

interface Envelope {
  readonly version: number;
  readonly state: SessionState;
}

/** sessionStorage can throw in private mode; every access is guarded. */
export function loadSession(): SessionState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return INITIAL_SESSION;
    const parsed = JSON.parse(raw) as Envelope;
    if (parsed.version !== VERSION) return INITIAL_SESSION;
    return { ...INITIAL_SESSION, ...parsed.state };
  } catch {
    return INITIAL_SESSION;
  }
}

export function saveSession(state: SessionState): void {
  try {
    const envelope: Envelope = { version: VERSION, state };
    sessionStorage.setItem(KEY, JSON.stringify(envelope));
  } catch {
    // Storage unavailable — the app still works, it just will not survive a refresh.
  }
}
