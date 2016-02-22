///<reference path="../project.d.ts"/>
import { RRule } from "rrule";
import { verify } from "updraft";
import { t } from "../i18n";

export { RRule };

export enum Frequency {
  YEAR,
  MONTH,
  WEEK,
  DAY,
}

export module Frequency {
  export function parse(idx: string): Frequency { return (Frequency as any)[idx]; }
  export function tr(name: string): string { return t("Frequency." + name); }
  export function toRRuleFreq(value: Frequency): __RRule.Frequency {
    verify(typeof value == "number", "value is not a number: %s", value);
    switch (value) {
      case Frequency.YEAR: return RRule.YEARLY;
      case Frequency.MONTH: return RRule.MONTHLY;
      case Frequency.WEEK: return RRule.WEEKLY;
      case Frequency.DAY: return RRule.DAILY;
      default:
        throw new Error("invalid Frequency value: " + value);
    }
  }
  export function fromRRuleFreq(value: __RRule.Frequency): Frequency {
    switch (value) {
      case RRule.YEARLY: return Frequency.YEAR;
      case RRule.MONTHLY: return Frequency.MONTH;
      case RRule.WEEKLY: return Frequency.WEEK;
      case RRule.DAILY: return Frequency.DAY;
      default:
        throw new Error("invalid Frequency value: " + value);
    }
  }
}
