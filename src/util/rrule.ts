///<reference path="../project.d.ts"/>

import { RRule } from "rrule";
export { RRule };

export function rruleFixText(rrule: __RRule.RRule): string {
  // leave recurrence text as empty
  if (rrule.origOptions.count == 1) {
    return "";
  }

  // fix text string by removing the hack to get closest date so it appears 
  // "monthly" instead of "every month on the 28th, 29th, 30th and 31st" 
  const fixedOpts = _.extend({}, rrule.origOptions) as __RRule.Options;
  delete fixedOpts.bymonthday;
  delete fixedOpts.bysetpos;
  return (new RRule(fixedOpts)).toText();
}


export function rruleFixEndOfMonth(opts: __RRule.Options) {
  if (opts.freq == RRule.MONTHLY) {
    const date = opts.dtstart.getDate();
    if (date > 28) {
      // make closest date for months with insufficent days
      opts.bymonthday = _.range(28, date + 1);
      opts.bysetpos = -1;
    }
  }
}
