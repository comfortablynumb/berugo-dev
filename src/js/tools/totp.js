const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(str) {
  const clean = str.toUpperCase().replace(/\s+/g, '').replace(/=+$/, '');
  const bytes = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);

    if (idx === -1) throw new Error('Invalid base32 character: ' + ch);

    buffer = (buffer << 5) | idx;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bytes.push((buffer >>> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }

  return new Uint8Array(bytes);
}

async function hmacSha1(keyBytes, msgBuffer) {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, msgBuffer));
}

function timeBuffer(step) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(4, step >>> 0, false);
  return buf;
}

async function generateTotp(secret, period, digits) {
  const keyBytes = base32Decode(secret);
  const step = Math.floor(Date.now() / 1000 / period);
  const mac = await hmacSha1(keyBytes, timeBuffer(step));
  const offset = mac[mac.length - 1] & 0x0f;
  const code = (
    ((mac[offset] & 0x7f) << 24) |
    ((mac[offset + 1] & 0xff) << 16) |
    ((mac[offset + 2] & 0xff) << 8) |
    (mac[offset + 3] & 0xff)
  ) % Math.pow(10, digits);
  return String(code).padStart(digits, '0');
}

function getRemaining(period) {
  return period - (Math.floor(Date.now() / 1000) % period);
}

function updateCountdown(period) {
  const rem = getRemaining(period);
  $('#totp-remaining').text(`Refreshes in ${rem}s`);
  $('#totp-progress').css('width', `${(rem / period) * 100}%`);
}

async function refresh() {
  const secret = $('#totp-secret').val().trim();
  const period = parseInt($('#totp-period').val(), 10) || 30;
  const digits = parseInt($('#totp-digits').val(), 10) || 6;

  if (!secret) return;

  try {
    const code = await generateTotp(secret, period, digits);
    $('#totp-code').text(code);
    $('#totp-result').removeClass('hidden');
    $('#totp-error').addClass('hidden');
    updateCountdown(period);
  } catch (e) {
    $('#totp-error').text(e.message).removeClass('hidden');
    $('#totp-result').addClass('hidden');
  }
}

export function initTotp() {
  let timer = null;

  $('#totp-generate').on('click', () => {
    clearInterval(timer);
    refresh();
    const period = parseInt($('#totp-period').val(), 10) || 30;
    timer = setInterval(() => {
      refresh();
    }, 1000);
    setInterval(() => updateCountdown(period), 1000);
  });

  $('#totp-secret').on('keydown', e => { if (e.key === 'Enter') $('#totp-generate').trigger('click'); });
}
