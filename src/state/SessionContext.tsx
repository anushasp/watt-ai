import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { PLANS, CURRENT_PLAN_NAME } from '@/mocks/plans';
import { rankPlans, currentAnnualCost } from '@/services/recommendation';
import type { PlanEstimate } from '@/types';
import { loadSession, saveSession } from './persistence';
import { sessionReducer, type SessionAction, type SessionState } from './sessionReducer';

interface SessionValue {
  readonly state: SessionState;
  readonly dispatch: Dispatch<SessionAction>;
  /** Every plan, costed for this household. Recomputed whenever bill or profile changes. */
  readonly estimates: readonly PlanEstimate[];
  /** Annual cost of the plan they are on now — the baseline for every savings figure. */
  readonly currentAnnual: number;
  readonly currentPlanName: string;
}

const SessionCtx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, undefined, loadSession);

  useEffect(() => {
    saveSession(state);
  }, [state]);

  const value = useMemo<SessionValue>(() => {
    const estimates = rankPlans(PLANS, state.bill, state.profile);
    return {
      state,
      dispatch,
      estimates,
      currentAnnual: currentAnnualCost(state.bill, state.profile),
      currentPlanName: state.bill?.planName ?? CURRENT_PLAN_NAME,
    };
  }, [state]);

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): SessionValue {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used inside a SessionProvider');
  return ctx;
}

/** The single recommended plan — the top of the ranking. */
export function useRecommendedPlan(): PlanEstimate | null {
  const { estimates } = useSession();
  return estimates[0] ?? null;
}
