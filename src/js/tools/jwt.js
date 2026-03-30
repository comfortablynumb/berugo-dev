import * as jose from 'https://cdn.jsdelivr.net/npm/jose@5/+esm';
import { syntaxHighlightJson, copyToClipboard } from '../utils.js';

function parseJwtParts(token) {
  const parts = token.trim().split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT: must have exactly 3 parts.');
  }

  function decodeBase64Url(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      str.length + (4 - str.length % 4) % 4, '='
    );
    return JSON.parse(atob(padded));
  }

  return {
    header: decodeBase64Url(parts[0]),
    payload: decodeBase64Url(parts[1]),
  };
}

async function importVerifyKey(alg, keyInput) {
  if (alg.startsWith('HS')) {
    return new TextEncoder().encode(keyInput);
  }

  const isPem = keyInput.trim().startsWith('-----');

  if (isPem) {
    return await jose.importSPKI(keyInput, alg);
  }

  const jwk = JSON.parse(keyInput);
  return await jose.importJWK(jwk, alg);
}

async function importSignKey(alg, keyInput) {
  if (alg.startsWith('HS')) {
    return new TextEncoder().encode(keyInput);
  }

  const isPem = keyInput.trim().startsWith('-----');

  if (isPem) {
    return await jose.importPKCS8(keyInput, alg);
  }

  const jwk = JSON.parse(keyInput);
  return await jose.importJWK(jwk, alg);
}

export function initJwt() {
  initJwtDecoder();
  initJwtVerifier();
  initJwtGenerator();
}

function initJwtDecoder() {
  $('#jwt-decode-btn').on('click', () => {
    const token = $('#jwt-decode-input').val().trim();
    const $error = $('#jwt-decode-error');
    const $header = $('#jwt-decode-header');
    const $payload = $('#jwt-decode-payload');

    $error.addClass('hidden').text('');

    try {
      const { header, payload } = parseJwtParts(token);
      $header.html(syntaxHighlightJson(header));
      $payload.html(syntaxHighlightJson(payload));
      $('#jwt-decode-result').removeClass('hidden');
    } catch (e) {
      $error.text(e.message).removeClass('hidden');
      $('#jwt-decode-result').addClass('hidden');
    }
  });

  $('#jwt-decode-copy-payload').on('click', () => {
    const token = $('#jwt-decode-input').val().trim();
    try {
      const { payload } = parseJwtParts(token);
      copyToClipboard(JSON.stringify(payload, null, 2), '#jwt-decode-copy-payload');
    } catch (_) {}
  });
}

function initJwtVerifier() {
  $('#jwt-verify-btn').on('click', async () => {
    const token = $('#jwt-verify-input').val().trim();
    const keyInput = $('#jwt-verify-key').val().trim();
    const $status = $('#jwt-verify-status');
    const $payload = $('#jwt-verify-payload');
    const $error = $('#jwt-verify-error');

    $error.addClass('hidden').text('');
    $status.addClass('hidden');
    $payload.html('');

    try {
      const { header } = parseJwtParts(token);
      const alg = header.alg;
      const key = await importVerifyKey(alg, keyInput);
      const { payload } = await jose.jwtVerify(token, key);
      $status.removeClass('hidden').html(
        '<span class="success-text font-medium">Signature valid</span>'
      );
      $payload.html(syntaxHighlightJson(payload));
      $('#jwt-verify-result').removeClass('hidden');
    } catch (e) {
      $error.text('Verification failed: ' + e.message).removeClass('hidden');
      $('#jwt-verify-result').addClass('hidden');
    }
  });
}

function initJwtGenerator() {
  const now = Math.floor(Date.now() / 1000);
  $('#jwt-generate-payload').val(
    JSON.stringify({ sub: 'user123', iat: now, exp: now + 3600 }, null, 2)
  );

  $('#jwt-generate-btn').on('click', async () => {
    const $error = $('#jwt-generate-error');
    const $output = $('#jwt-generate-output');

    $error.addClass('hidden').text('');
    $output.val('');

    try {
      const alg = $('#jwt-generate-alg').val();
      const keyInput = $('#jwt-generate-key').val().trim();
      const payloadText = $('#jwt-generate-payload').val().trim();
      const payload = JSON.parse(payloadText);
      const key = await importSignKey(alg, keyInput);
      const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg })
        .sign(key);
      $output.val(jwt);
    } catch (e) {
      $error.text('Generation failed: ' + e.message).removeClass('hidden');
    }
  });

  $('#jwt-generate-copy').on('click', () => {
    copyToClipboard($('#jwt-generate-output').val(), '#jwt-generate-copy');
  });
}
