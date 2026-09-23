import type { ParsedBill } from '@/types';

/**
 * The sample bill used by "Try a Sample Bill". These figures are invented and are
 * the single origin of every derived number in the demo.
 */
export const SAMPLE_BILL: ParsedBill = {
  id: 'sample-bill-march',
  provider: 'Harbour Electric',
  planName: 'Basic Residential',
  periodStart: '2026-02-18',
  periodEnd: '2026-03-19',
  usageKwh: 1428,
  energyCharge: 231.34,
  deliveryCharge: 41.5,
  total: 272.84,
  contractExpiry: '2026-07-31',
  previousTotal: 254.12,
  previousUsageKwh: 1316,
  lineItems: [
    { label: 'Energy charge, 1,428 kWh at 16.2 cents', amount: 231.34 },
    { label: 'Delivery and network charge', amount: 33.2 },
    { label: 'Metering charge', amount: 6.3 },
    { label: 'Regulatory fee', amount: 2.0 },
  ],
};

/**
 * A second sample with deliberate extraction gaps, so the "Not found." path is
 * reachable in the demo without inventing a failure.
 */
export const PARTIAL_BILL: ParsedBill = {
  id: 'sample-bill-partial',
  provider: 'Harbour Electric',
  planName: null,
  periodStart: '2026-02-18',
  periodEnd: '2026-03-19',
  usageKwh: 1428,
  energyCharge: 231.34,
  deliveryCharge: 41.5,
  total: 272.84,
  contractExpiry: null,
  previousTotal: 254.12,
  previousUsageKwh: 1316,
  lineItems: [{ label: 'Energy charge, 1,428 kWh at 16.2 cents', amount: 231.34 }],
};
