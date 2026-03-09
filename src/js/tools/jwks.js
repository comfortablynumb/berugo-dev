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

  return { publicJwk, privateJwk };
}

function buildJwks(jwk) {
  return { keys: [jwk] };
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

    try {
      const { publicJwk, privateJwk } = keyType === 'RSA'
        ? await generateRsaKeyPair()
        : await generateEcKeyPair();

      $publicOut.val(JSON.stringify(buildJwks(publicJwk), null, 2));
      $privateOut.val(JSON.stringify(buildJwks(privateJwk), null, 2));
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
