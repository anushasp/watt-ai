/** A charge line lifted from a bill. */
export interface BillLineItem {
  readonly label: string;
  readonly amount: number;
}

/**
 * A parsed electricity bill.
 *
 * Every field that would come from document extraction is `T | null`. `null` means
 * "we could not read this" and renders as "Not found." — it is never silently
 * defaulted to zero, which would corrupt every downstream calculation.
 */
export interface ParsedBill {
  readonly id: string;
  readonly provider: string | null;
  readonly planName: string | null;
  readonly periodStart: string | null;
  readonly periodEnd: string | null;
  /** Billed consumption for the period, in kWh. */
  readonly usageKwh: number | null;
  readonly energyCharge: number | null;
  readonly deliveryCharge: number | null;
  readonly total: number | null;
  readonly contractExpiry: string | null;
  readonly lineItems: readonly BillLineItem[];
  /** Total of the immediately preceding bill, for the "vs last month" comparison. */
  readonly previousTotal: number | null;
  /** Consumption of the immediately preceding bill, in kWh. */
  readonly previousUsageKwh: number | null;
}

/** Fields the user may correct on the Review step. */
export type EditableBillField =
  | 'provider'
  | 'planName'
  | 'usageKwh'
  | 'energyCharge'
  | 'deliveryCharge'
  | 'total'
  | 'contractExpiry';
