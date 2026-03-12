import { copyToClipboard } from '../utils.js';

function pluralize(n, unit) {
  return `${n} ${unit}${n !== 1 ? 's' : ''}`;
}

function buildCalendarDiff(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();

  if (days < 0) {
    months--;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${pluralize(years, 'year')}, ${pluralize(months, 'month')}, ${pluralize(days, 'day')}`;
}

function buildDiffRows(from, to) {
  const totalMs = to - from;
  const totalSecs = Math.floor(totalMs / 1000);
  const totalMins = Math.floor(totalSecs / 60);
  const totalHours = Math.floor(totalMins / 60);
  const totalDays = Math.floor(totalHours / 24);

  return [
    ['Calendar', buildCalendarDiff(from, to)],
    ['Total days', totalDays.toLocaleString()],
    ['Total weeks', Math.floor(totalDays / 7).toLocaleString()],
    ['Total hours', totalHours.toLocaleString()],
    ['Total minutes', totalMins.toLocaleString()],
    ['Total seconds', totalSecs.toLocaleString()],
  ];
}

function renderDiffRows(rows) {
  return rows.map(([label, value]) => `
    <div class="flex gap-4 px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 first:border-t-0">
      <span class="w-36 text-sm text-gray-500 dark:text-gray-400 shrink-0">${label}</span>
      <span class="font-mono text-sm">${value}</span>
    </div>`).join('');
}

function calcDiff() {
  const a = new Date($('#dc-date-a').val());
  const b = new Date($('#dc-date-b').val());
  $('#dc-diff-result').addClass('hidden');
  $('#dc-diff-error').addClass('hidden');

  if (isNaN(a.getTime()) || isNaN(b.getTime())) {
    $('#dc-diff-error').removeClass('hidden').text('Please enter both valid dates.');
    return;
  }

  const [from, to] = a <= b ? [a, b] : [b, a];
  $('#dc-diff-rows').html(renderDiffRows(buildDiffRows(from, to)));
  $('#dc-diff-result').removeClass('hidden');
}

function applyDuration(base, amount, unit, sign) {
  const result = new Date(base);

  if (unit === 'days')    result.setDate(result.getDate() + sign * amount);
  else if (unit === 'weeks')   result.setDate(result.getDate() + sign * amount * 7);
  else if (unit === 'months')  result.setMonth(result.getMonth() + sign * amount);
  else if (unit === 'years')   result.setFullYear(result.getFullYear() + sign * amount);
  else if (unit === 'hours')   result.setHours(result.getHours() + sign * amount);
  else if (unit === 'minutes') result.setMinutes(result.getMinutes() + sign * amount);

  return result;
}

function calcArith() {
  const base = new Date($('#dc-arith-base').val());
  const amount = parseInt($('#dc-arith-amount').val()) || 0;
  const unit = $('#dc-arith-unit').val();
  const sign = $('input[name="dc-arith-op"]:checked').val() === 'add' ? 1 : -1;
  $('#dc-arith-result').addClass('hidden');
  $('#dc-arith-error').addClass('hidden');

  if (isNaN(base.getTime())) {
    $('#dc-arith-error').removeClass('hidden').text('Please enter a valid date.');
    return;
  }

  $('#dc-arith-output').val(applyDuration(base, amount, unit, sign).toISOString().split('T')[0]);
  $('#dc-arith-result').removeClass('hidden');
}

export function initDateCalc() {
  const today = new Date().toISOString().split('T')[0];
  $('#dc-date-a').val(today);
  $('#dc-date-b').val(today);
  $('#dc-arith-base').val(today);

  $('#dc-diff-btn').on('click', calcDiff);
  $('#dc-arith-btn').on('click', calcArith);
  $('#dc-arith-copy').on('click', () => copyToClipboard($('#dc-arith-output').val(), '#dc-arith-copy'));
}
