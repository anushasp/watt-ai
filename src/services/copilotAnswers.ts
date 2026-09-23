/**
 * Builds the simulated assistant's replies.
 *
 * Every number here comes from the recommendation engine and the session's bill, so the
 * Copilot cannot contradict the Plans page or the Dashboard. Nothing is sent anywhere and
 * there is no model behind this — it is keyword routing over deterministic calculations.
 */
import { INTENT_KEYWORDS, type CopilotIntent } from '@/mocks/copilot';
import { ENERGY_FLOW, END_USES } from '@/mocks/energy';
import type { ChatCalculation, ChatMessage, ParsedBill, PlanEstimate } from '@/types';
import {
  changeVsLastMonth,
  describeComparison,
  formatKwh,
  formatKw,
  formatMoney,
  formatRate,
} from './money';
import { EV_ANNUAL_KWH, SOLAR_OFFSET } from './recommendation';

export function routeIntent(question: string): CopilotIntent {
  const lower = question.toLowerCase();
  for (const { intent, keywords } of INTENT_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return intent;
  }
  return 'fallback';
}

export interface AnswerContext {
  readonly bill: ParsedBill | null;
  readonly estimates: readonly PlanEstimate[];
  readonly currentPlanName: string;
  readonly currentAnnual: number;
  readonly focusPlan: PlanEstimate | null;
}

interface Answer {
  readonly text: string;
  readonly calculations: readonly ChatCalculation[];
  readonly sources: readonly string[];
}

export function buildAnswer(question: string, ctx: AnswerContext): Answer {
  const intent = routeIntent(question);
  const best = ctx.focusPlan ?? ctx.estimates[0] ?? null;
  const monthlyNow = ctx.currentAnnual / 12;

  switch (intent) {
    case 'bill-change': {
      if (ctx.bill?.total == null || ctx.bill.previousTotal == null) {
        return {
          text: 'I do not have two bills to compare yet. Analyze a bill and I can tell you exactly what moved between periods.',
          calculations: [],
          sources: ['Your analyzed bill'],
        };
      }
      const comparison = changeVsLastMonth(ctx.bill.total, ctx.bill.previousTotal);
      const usageDelta =
        ctx.bill.usageKwh != null && ctx.bill.previousUsageKwh != null
          ? ctx.bill.usageKwh - ctx.bill.previousUsageKwh
          : null;
      return {
        text: `Your bill is ${describeComparison(comparison)}. ${
          usageDelta === null
            ? 'The change is in the charges rather than the energy used.'
            : `You used ${formatKwh(Math.abs(usageDelta))} ${usageDelta > 0 ? 'more' : 'less'} than last period, which accounts for most of it.`
        } This compares two bills on the same plan, so it is a different question from whether a different plan would be cheaper.`,
        calculations: [
          { label: 'This bill', value: formatMoney(ctx.bill.total) },
          { label: 'Previous bill', value: formatMoney(ctx.bill.previousTotal) },
          { label: 'Change vs last month', value: formatMoney(Math.abs(comparison.amount)) },
          ...(usageDelta === null
            ? []
            : [{ label: 'Usage change', value: formatKwh(Math.abs(usageDelta)) }]),
        ],
        sources: ['Your analyzed bill', 'Your previous bill total'],
      };
    }

    case 'ev': {
      const monthlyEvKwh = Math.round(EV_ANNUAL_KWH / 12);
      const rate = best?.plan.offPeakRate ?? 0.112;
      const cost = monthlyEvKwh * rate;
      const peakCost = monthlyEvKwh * (best?.plan.ratePerKwh ?? 0.198);
      return {
        text: `An EV adds roughly ${formatKwh(monthlyEvKwh)} a month. Charged overnight on ${
          best?.plan.name ?? 'an overnight plan'
        } that is about ${formatMoney(cost, { cents: false })} a month. Charged in the evening peak instead it would be closer to ${formatMoney(peakCost, { cents: false })}, so the timing matters more than the plan name.`,
        calculations: [
          { label: 'Added usage', value: `${formatKwh(monthlyEvKwh)} a month` },
          { label: 'Overnight rate', value: formatRate(rate) },
          { label: 'Charging overnight', value: `${formatMoney(cost, { cents: false })} a month` },
          { label: 'Charging at peak', value: `${formatMoney(peakCost, { cents: false })} a month` },
        ],
        sources: ['Your home profile', best ? `${best.plan.name} rates` : 'Plan database'],
      };
    }

    case 'solar': {
      const offset = Math.round(SOLAR_OFFSET * 100);
      const annualKwh = best?.annualKwh ?? 17136;
      const saved = (annualKwh * SOLAR_OFFSET * (best?.effectiveRate ?? 0.15)) / 12;
      return {
        text: `In this model solar offsets about ${offset} percent of your annual consumption. On your estimated ${formatKwh(annualKwh)} a year that is roughly ${formatMoney(saved, { cents: false })} a month off the energy portion of the bill. Delivery charges do not move, which is why solar rarely takes a bill to zero.`,
        calculations: [
          { label: 'Estimated annual usage', value: formatKwh(annualKwh) },
          { label: 'Assumed solar offset', value: `${offset} percent` },
          { label: 'Energy saved a month', value: formatMoney(saved, { cents: false }) },
          { label: 'Delivery charge', value: 'Unchanged' },
        ],
        sources: ['Your home profile', 'wattsAI solar assumption'],
      };
    }

    case 'switch-plan': {
      if (!best) {
        return {
          text: 'I do not have a ranked plan list yet. Analyze a bill and complete your home profile and I will rank every plan against your usage.',
          calculations: [],
          sources: ['Plan database'],
        };
      }
      const saves = best.annualSavingsVsCurrent > 0;
      return {
        text: `${best.plan.name} from ${best.plan.retailer} is the strongest match at ${formatMoney(best.estimatedMonthly, { cents: false })} a month. Against ${ctx.currentPlanName} that is ${formatMoney(Math.abs(best.annualSavingsVsCurrent), { cents: false })} a year ${saves ? 'less' : 'more'}. ${best.reasons[0] ?? ''}`,
        calculations: [
          { label: 'Current plan', value: `${formatMoney(monthlyNow, { cents: false })} a month` },
          { label: best.plan.name, value: `${formatMoney(best.estimatedMonthly, { cents: false })} a month` },
          {
            label: 'Est. savings vs your current plan',
            value: `${formatMoney(best.annualSavingsVsCurrent, { cents: false })} a year`,
          },
          { label: 'Contract', value: best.plan.contractMonths === 0 ? 'Month to month' : `${best.plan.contractMonths} months` },
        ],
        sources: ['Your analyzed bill', 'Your home profile', 'Plan database'],
      };
    }

    case 'standby': {
      const alwaysOn = ENERGY_FLOW.loads.find((l) => l.id === 'always-on');
      const kw = alwaysOn?.kw ?? 0.5;
      const monthlyKwh = kw * 24 * 30;
      return {
        text: `Your always-on load sits at ${formatKw(kw)}, which is what the home draws at its quietest. Over a month that is about ${formatKwh(monthlyKwh)}, or ${formatMoney(monthlyKwh * 0.162, { cents: false })}. For a home this size that is on the high side. A second fridge, a pool pump on a full-time timer or networking gear are the usual causes.`,
        calculations: [
          { label: 'Always-on power', value: formatKw(kw) },
          { label: 'Over a month', value: formatKwh(monthlyKwh) },
          { label: 'Estimated cost', value: `${formatMoney(monthlyKwh * 0.162, { cents: false })} a month` },
        ],
        sources: ['Simulated meter readings'],
      };
    }

    case 'shift-usage': {
      const hvac = END_USES[0];
      return {
        text: `Most of the win is in the 4 to 7 PM window. ${hvac?.label ?? 'Heating and cooling'} is your largest load at ${formatKwh(hvac?.kwh ?? 512)} this period. Moving the dishwasher and the dryer past 9 PM, and pre-cooling before 4 PM, shifts roughly 6 kWh a week out of the peak window without using less energy overall.`,
        calculations: [
          { label: 'Largest end use', value: `${hvac?.label ?? 'Heating and cooling'}, ${formatKwh(hvac?.kwh ?? 512)}` },
          { label: 'Shiftable each week', value: formatKwh(6) },
          { label: 'Peak window', value: '4 PM to 7 PM' },
        ],
        sources: ['Simulated usage by end use', 'Your tariff windows'],
      };
    }

    case 'savings': {
      const target = 30;
      const fromPlan = best ? Math.max(0, best.monthlySavingsVsCurrent) : 0;
      const remaining = Math.max(0, target - fromPlan);
      return {
        text: `Getting to ${formatMoney(target, { cents: false })} a month is realistic. Switching to ${best?.plan.name ?? 'a better-matched plan'} accounts for about ${formatMoney(fromPlan, { cents: false })} of it. The remaining ${formatMoney(remaining, { cents: false })} comes from shifting the evening peak and trimming the always-on load.`,
        calculations: [
          { label: 'Target', value: `${formatMoney(target, { cents: false })} a month` },
          { label: 'From switching plan', value: formatMoney(fromPlan, { cents: false }) },
          { label: 'From shifting usage', value: formatMoney(remaining, { cents: false }) },
        ],
        sources: ['Your analyzed bill', 'Plan database', 'Simulated usage'],
      };
    }

    case 'fallback':
    default:
      return {
        text: `I can work through your bill, your usage, plan comparisons, EV charging and solar. Try asking why your bill changed, how to save ${formatMoney(30, { cents: false })}, or whether switching plans is worth it.`,
        calculations: [],
        sources: [],
      };
  }
}

let counter = 0;
export function makeMessage(
  role: 'user' | 'assistant',
  text: string,
  extras: Partial<Pick<ChatMessage, 'calculations' | 'sources'>> = {},
): ChatMessage {
  counter += 1;
  return {
    id: `msg-${counter}-${role}`,
    role,
    text,
    simulated: role === 'assistant',
    ...(extras.calculations ? { calculations: extras.calculations } : {}),
    ...(extras.sources ? { sources: extras.sources } : {}),
  };
}
