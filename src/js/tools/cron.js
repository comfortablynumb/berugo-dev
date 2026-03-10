const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function parseField(fieldStr, min, max) {
  const values = new Set();

  for (const part of fieldStr.split(',')) {
    if (part === '*') {
      for (let i = min; i <= max; i++) values.add(i);
      continue;
    }

    if (part.includes('/')) {
      const [range, stepStr] = part.split('/');
      const step = parseInt(stepStr, 10);
      let start = min;
      let end = max;

      if (range !== '*') {
        if (range.includes('-')) {
          const [a, b] = range.split('-').map(Number);
          start = a;
          end = b;
        } else {
          start = parseInt(range, 10);
        }
      }

      for (let i = start; i <= end; i += step) values.add(i);
      continue;
    }

    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let i = a; i <= b; i++) values.add(i);
      continue;
    }

    values.add(parseInt(part, 10));
  }

  return values;
}

function matchField(value, validSet) {
  return validSet.has(value);
}

function describeMinute(f) {
  if (f === '*') return null;
  if (f === '0') return 'at the start of the hour';
  if (f.startsWith('*/')) return `every ${f.slice(2)} minutes`;
  return `at minute ${f}`;
}

function describeHour(f) {
  if (f === '*') return 'every hour';
  if (f.startsWith('*/')) return `every ${f.slice(2)} hours`;
  return null;
}

function describeTime(minuteF, hourF) {
  if (hourF !== '*' && !hourF.includes(',') && !hourF.includes('/') && !hourF.includes('-')) {
    const h = parseInt(hourF, 10);
    const m = minuteF === '*' ? '00' : minuteF.padStart(2, '0');
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `at ${h12}:${m} ${suffix}`;
  }

  return null;
}

function describeDom(f) {
  if (f === '*') return null;
  if (f === '1') return 'on the 1st';
  if (f === '2') return 'on the 2nd';
  if (f === '3') return 'on the 3rd';
  if (!isNaN(parseInt(f, 10))) return `on the ${f}th`;
  if (f.startsWith('*/')) return `every ${f.slice(2)} days`;
  return `on day-of-month ${f}`;
}

function describeMonth(f) {
  if (f === '*') return null;
  if (!isNaN(parseInt(f, 10))) return `in ${MONTH_NAMES[parseInt(f, 10) - 1]}`;
  return `in month ${f}`;
}

function describeDow(f) {
  if (f === '*') return null;
  if (f === '1-5') return 'Monday through Friday';
  if (f === '0' || f === '7') return 'on Sundays';
  if (f === '6') return 'on Saturdays';
  if (!isNaN(parseInt(f, 10))) return `on ${DOW_NAMES[parseInt(f, 10) % 7]}s`;
  return `on day-of-week ${f}`;
}

function buildDescription(fields) {
  const [minuteF, hourF, domF, monthF, dowF] = fields;

  if (minuteF === '*/5' && hourF === '*' && domF === '*' && monthF === '*' && dowF === '*') {
    return 'Every 5 minutes';
  }

  if (minuteF.startsWith('*/') && hourF === '*' && domF === '*' && monthF === '*' && dowF === '*') {
    return `Every ${minuteF.slice(2)} minutes`;
  }

  if (minuteF === '*' && hourF === '*' && domF === '*' && monthF === '*' && dowF === '*') {
    return 'Every minute';
  }

  const parts = [];
  const timeDesc = describeTime(minuteF, hourF);

  if (timeDesc) {
    parts.push(timeDesc);
  } else {
    const hDesc = describeHour(hourF);
    const mDesc = describeMinute(minuteF);
    if (hDesc) parts.push(hDesc);
    if (mDesc) parts.push(mDesc);
  }

  const domDesc = describeDom(domF);
  const dowDesc = describeDow(dowF);
  const monthDesc = describeMonth(monthF);

  if (domDesc) parts.push(domDesc);
  if (dowDesc) parts.push(dowDesc);
  if (monthDesc) parts.push(monthDesc);

  if (parts.length === 0) return 'Every minute';
  return parts.join(', ');
}

function findNextRuns(fields, count) {
  const [minuteF, hourF, domF, monthF, dowF] = fields;
  const minSet = parseField(minuteF, 0, 59);
  const hourSet = parseField(hourF, 0, 23);
  const domSet = parseField(domF, 1, 31);
  const monthSet = parseField(monthF, 1, 12);
  const dowSet = parseField(dowF, 0, 6);

  const results = [];
  const date = new Date();
  date.setSeconds(0, 0);
  date.setMinutes(date.getMinutes() + 1);

  let iterations = 0;

  while (results.length < count && iterations < 600000) {
    iterations++;

    const min = date.getMinutes();
    const hour = date.getHours();
    const dom = date.getDate();
    const month = date.getMonth() + 1;
    const dow = date.getDay();

    if (
      matchField(month, monthSet) &&
      matchField(dom, domSet) &&
      matchField(dow, dowSet) &&
      matchField(hour, hourSet) &&
      matchField(min, minSet)
    ) {
      results.push(new Date(date));
    }

    date.setMinutes(date.getMinutes() + 1);
  }

  return results;
}

function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);

  if (parts.length === 5) return parts;
  if (parts.length === 6) return parts.slice(1); // drop seconds field

  throw new Error('Cron expression must have 5 or 6 fields');
}

function formatDate(d) {
  return d.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function initCron() {
  const $input = $('#cron-input');
  const $error = $('#cron-error');
  const $description = $('#cron-description');
  const $runs = $('#cron-runs');
  const $result = $('#cron-result');

  function run() {
    const expr = $input.val().trim();

    if (!expr) {
      $result.addClass('hidden');
      $error.addClass('hidden');
      return;
    }

    try {
      const fields = parseCron(expr);
      const description = buildDescription(fields);
      const nextRuns = findNextRuns(fields, 5);

      $description.text(description);
      $runs.html(nextRuns.map(d => `<li class="py-1">${formatDate(d)}</li>`).join(''));
      $result.removeClass('hidden');
      $error.addClass('hidden');
    } catch (e) {
      $error.text(e.message).removeClass('hidden');
      $result.addClass('hidden');
    }
  }

  $('#cron-btn').on('click', run);

  $input.on('keydown', e => {
    if (e.key === 'Enter') run();
  });
}
