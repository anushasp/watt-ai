import type { HomeProfile, ParsedBill } from '@/types';
import { EMPTY_PROFILE } from '@/types';

export type UploadStatus = 'empty' | 'uploading' | 'uploaded' | 'processing' | 'error';

export interface UploadedFile {
  readonly name: string;
  readonly size: number;
  readonly type: string;
}

export interface SessionState {
  readonly uploadStatus: UploadStatus;
  readonly file: UploadedFile | null;
  readonly uploadError: string | null;
  /** True when the bill came from "Try a Sample Bill" rather than a chosen file. */
  readonly usedSample: boolean;
  readonly bill: ParsedBill | null;
  readonly billConfirmed: boolean;
  readonly profile: HomeProfile;
  readonly profileSubmitted: boolean;
  readonly dismissedInsights: readonly string[];
  readonly selectedPlanId: string | null;
}

export const INITIAL_SESSION: SessionState = {
  uploadStatus: 'empty',
  file: null,
  uploadError: null,
  usedSample: false,
  bill: null,
  billConfirmed: false,
  profile: EMPTY_PROFILE,
  profileSubmitted: false,
  dismissedInsights: [],
  selectedPlanId: null,
};

export type SessionAction =
  | { type: 'UPLOAD_START'; file: UploadedFile }
  | { type: 'UPLOAD_ERROR'; message: string }
  | { type: 'UPLOAD_COMPLETE' }
  | { type: 'ANALYZE_START' }
  | { type: 'ANALYZE_COMPLETE'; bill: ParsedBill; usedSample: boolean }
  /** Removing or replacing the bill invalidates the analysis and everything derived from it. */
  | { type: 'RESET_ANALYSIS' }
  | { type: 'EDIT_BILL'; bill: ParsedBill }
  | { type: 'CONFIRM_BILL' }
  | { type: 'UPDATE_PROFILE'; patch: Partial<HomeProfile> }
  | { type: 'SUBMIT_PROFILE' }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'RESTORE_INSIGHT'; id: string }
  | { type: 'SELECT_PLAN'; planId: string | null };

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'UPLOAD_START':
      return { ...state, uploadStatus: 'uploading', file: action.file, uploadError: null };
    case 'UPLOAD_ERROR':
      return { ...state, uploadStatus: 'error', file: null, uploadError: action.message };
    case 'UPLOAD_COMPLETE':
      return { ...state, uploadStatus: 'uploaded', uploadError: null };
    case 'ANALYZE_START':
      return { ...state, uploadStatus: 'processing', uploadError: null };
    case 'ANALYZE_COMPLETE':
      return {
        ...state,
        uploadStatus: 'uploaded',
        bill: action.bill,
        usedSample: action.usedSample,
        billConfirmed: false,
      };
    /**
     * Clears the bill AND every derived result. Recommendations, projections and the
     * Copilot's bill context all hang off `bill`, so dropping it invalidates them together.
     */
    case 'RESET_ANALYSIS':
      return {
        ...INITIAL_SESSION,
        // A profile the user already filled in is their input, not a derived result.
        profile: state.profile,
      };
    case 'EDIT_BILL':
      return { ...state, bill: action.bill };
    case 'CONFIRM_BILL':
      return { ...state, billConfirmed: true };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'SUBMIT_PROFILE':
      return { ...state, profileSubmitted: true };
    case 'DISMISS_INSIGHT':
      return state.dismissedInsights.includes(action.id)
        ? state
        : { ...state, dismissedInsights: [...state.dismissedInsights, action.id] };
    case 'RESTORE_INSIGHT':
      return {
        ...state,
        dismissedInsights: state.dismissedInsights.filter((id) => id !== action.id),
      };
    case 'SELECT_PLAN':
      return { ...state, selectedPlanId: action.planId };
    default:
      return state;
  }
}

/** True once the bill has been analyzed — steps 2 and 3 are locked until then. */
export function hasAnalysis(state: SessionState): boolean {
  return state.bill !== null;
}
