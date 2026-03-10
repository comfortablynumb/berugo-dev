import { copyToClipboard } from '../utils.js';

const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';

function generateId(length, alphabet) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

function generateBatch(count, length, alphabet) {
  const ids = [];

  for (let i = 0; i < count; i++) {
    ids.push(generateId(length, alphabet));
  }

  return ids;
}

function run() {
  const length = Math.max(1, Math.min(256, parseInt($('#nanoid-length').val(), 10) || 21));
  const count = Math.max(1, Math.min(100, parseInt($('#nanoid-count').val(), 10) || 1));
  const alphabet = $('#nanoid-alphabet').val() || DEFAULT_ALPHABET;

  if (alphabet.length < 2) {
    $('#nanoid-error').text('Alphabet must have at least 2 characters.').removeClass('hidden');
    return;
  }

  $('#nanoid-error').addClass('hidden');
  const ids = generateBatch(count, length, alphabet);
  $('#nanoid-output').val(ids.join('\n'));
}

export function initNanoid() {
  $('#nanoid-generate').on('click', run);
  $('#nanoid-copy').on('click', () => copyToClipboard($('#nanoid-output').val(), '#nanoid-copy'));

  $('#nanoid-clear').on('click', () => {
    $('#nanoid-output').val('');
    $('#nanoid-error').addClass('hidden');
  });

  run();
}
