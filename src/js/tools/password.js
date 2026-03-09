import { copyToClipboard } from '../utils.js';

const CHARSETS = {
  lower:   'abcdefghijklmnopqrstuvwxyz',
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits:  '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?',
};

function shuffle(arr) {
  const rands = crypto.getRandomValues(new Uint32Array(arr.length));

  for (let i = arr.length - 1; i > 0; i--) {
    const j = rands[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function buildPassword(length, selected) {
  const pool = selected.join('');
  const rands = crypto.getRandomValues(new Uint32Array(length + selected.length));
  let ri = 0;

  const chars = selected.map(cs => cs[rands[ri++] % cs.length]);
  while (chars.length < length) chars.push(pool[rands[ri++] % pool.length]);

  return shuffle(chars).join('');
}

function generate() {
  const length = Math.min(Math.max(parseInt($('#pwd-length').val()) || 16, 4), 128);
  const selected = Object.entries(CHARSETS)
    .filter(([key]) => $(`#pwd-${key}`).is(':checked'))
    .map(([, cs]) => cs);

  if (!selected.length) {
    $('#pwd-error').removeClass('hidden').text('Select at least one character set.');
    return;
  }

  $('#pwd-error').addClass('hidden');
  $('#pwd-output').val(buildPassword(length, selected));
}

export function initPassword() {
  $('#pwd-generate-btn').on('click', generate);
  $('#pwd-copy-btn').on('click', () => copyToClipboard($('#pwd-output').val(), '#pwd-copy-btn'));
  generate();
}
