import * as jose from 'https://cdn.jsdelivr.net/npm/jose@5/+esm';
import { copyToClipboard } from '../utils.js';

async function generateRsaKeyPair() {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['sign', 'verify']
  );

  const publicJwk = await crypto.subtle.exportKey('jwk', publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', privateKey);
  publicJwk.use = 'sig';
  publicJwk.alg = 'RS256';
  privateJwk.use = 'sig';
  privateJwk.alg = 'RS256';

  const kid = await jose.calculateJwkThumbprint(publicJwk);
  publicJwk.kid = kid;
  privateJwk.kid = kid;

  return { publicJwk, privateJwk };
}

async function generateEcKeyPair() {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicJwk = await crypto.subtle.exportKey('jwk', publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', privateKey);
  publicJwk.use = 'sig';
  publicJwk.alg = 'ES256';
  privateJwk.use = 'sig';
  privateJwk.alg = 'ES256';

  const kid = await jose.calculateJwkThumbprint(publicJwk);
  publicJwk.kid = kid;
  privateJwk.kid = kid;

  return { publicJwk, privateJwk };
}

function buildJwks(jwks) {
  return { keys: jwks };
}

function clampKeyCount(val) {
  const n = parseInt(val, 10);

  if (isNaN(n) || n < 1) return 1;
  if (n > 20) return 20;

  return n;
}

export function initJwks() {
  const $error = $('#jwks-error');
  const $publicOut = $('#jwks-public-output');
  const $privateOut = $('#jwks-private-output');

  function clearState() {
    $error.addClass('hidden').text('');
    $publicOut.val('');
    $privateOut.val('');
    $('#jwks-result').addClass('hidden');
  }

  $('#jwks-generate-btn').on('click', async () => {
    clearState();
    const keyType = $('#jwks-key-type').val();
    const count = clampKeyCount($('#jwks-key-count').val());
    const generatePair = keyType === 'RSA' ? generateRsaKeyPair : generateEcKeyPair;

    try {
      const pairs = await Promise.all(Array.from({ length: count }, () => generatePair()));
      const publicJwks = pairs.map(p => p.publicJwk);
      const privateJwks = pairs.map(p => p.privateJwk);

      $publicOut.val(JSON.stringify(buildJwks(publicJwks), null, 2));
      $privateOut.val(JSON.stringify(buildJwks(privateJwks), null, 2));
      $('#jwks-result').removeClass('hidden');
    } catch (e) {
      $error.text('Key generation failed: ' + e.message).removeClass('hidden');
    }
  });

  $('#jwks-copy-public').on('click', () => {
    copyToClipboard($publicOut.val(), '#jwks-copy-public');
  });

  $('#jwks-copy-private').on('click', () => {
    copyToClipboard($privateOut.val(), '#jwks-copy-private');
  });
}
