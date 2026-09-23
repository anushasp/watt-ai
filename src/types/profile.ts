export type HomeType = 'apartment' | 'townhome' | 'single-family';

export type HomeSize = 'under-1000' | '1000-2000' | '2000-3000' | 'over-3000';

export type Priority =
  | 'lowest-bill'
  | 'predictable-cost'
  | 'renewable'
  | 'ev-charging'
  | 'backup-power';

export interface HomeProfile {
  readonly hasEv: boolean | null;
  readonly hasSolar: boolean | null;
  readonly hasBattery: boolean | null;
  readonly homeType: HomeType | null;
  readonly homeSize: HomeSize | null;
  readonly priority: Priority | null;
}

/** A profile with every required answer supplied. */
export type CompleteHomeProfile = {
  readonly [K in keyof HomeProfile]: NonNullable<HomeProfile[K]>;
};

export const EMPTY_PROFILE: HomeProfile = {
  hasEv: null,
  hasSolar: null,
  hasBattery: null,
  homeType: null,
  homeSize: null,
  priority: null,
};

export function isCompleteProfile(p: HomeProfile): p is CompleteHomeProfile {
  return (
    p.hasEv !== null &&
    p.hasSolar !== null &&
    p.hasBattery !== null &&
    p.homeType !== null &&
    p.homeSize !== null &&
    p.priority !== null
  );
}

export const HOME_TYPE_LABELS: Readonly<Record<HomeType, string>> = {
  apartment: 'Apartment',
  townhome: 'Townhome',
  'single-family': 'Single-family',
};

export const HOME_SIZE_LABELS: Readonly<Record<HomeSize, string>> = {
  'under-1000': 'Under 1,000 sq ft',
  '1000-2000': '1,000 to 2,000 sq ft',
  '2000-3000': '2,000 to 3,000 sq ft',
  'over-3000': 'Over 3,000 sq ft',
};

export const PRIORITY_LABELS: Readonly<Record<Priority, string>> = {
  'lowest-bill': 'Lowest bill',
  'predictable-cost': 'Predictable cost',
  renewable: 'Renewable energy',
  'ev-charging': 'EV charging',
  'backup-power': 'Backup power',
};
