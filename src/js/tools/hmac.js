import { copyToClipboard } from '../utils.js';

const HASH_ALGOS = {
  'SHA-1':   'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512',
};

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

async function computeHmac(message, key, algo, format) {
  const enc = new TextEncoder();
  const keyBytes = enc.encode(key);
  const msgBytes = enc.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: algo }, false, ['sign']
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, msgBytes));

  return format === 'base64' ? toBase64(sig) : toHex(sig);
}

async function runHmac() {
  const message = $('#hmac-message').val();
  const key = $('#hmac-key').val();
  const algo = $('#hmac-algo').val();
  const format = $('#hmac-format').val();

  if (!key) {
    $('#hmac-output').val('');
    $('#hmac-error').text('Key is required.').removeClass('hidden');
    return;
  }

  try {
    const result = await computeHmac(message, key, algo, format);
    $('#hmac-output').val(result);
    $('#hmac-error').addClass('hidden');
  } catch (e) {
    $('#hmac-error').text(e.message).removeClass('hidden');
    $('#hmac-output').val('');
  }
}

export function initHmac() {
  $('#hmac-message, #hmac-key, #hmac-algo, #hmac-format').on('input change', runHmac);
  $('#hmac-compute').on('click', runHmac);
  $('#hmac-copy').on('click', () => copyToClipboard('#hmac-output', '#hmac-copy'));
}
