import { copyToClipboard } from '../utils.js';

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function decodeBase64(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new TextDecoder().decode(bytes);
}

export function initBase64() {
  const $input = $('#base64-input');
  const $output = $('#base64-output');
  const $error = $('#base64-error');

  function clearError() {
    $error.text('').addClass('hidden');
  }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#base64-encode').on('click', () => {
    clearError();
    try {
      $output.val(encodeBase64($input.val()));
    } catch (e) {
      showError('Encode failed: ' + e.message);
    }
  });

  $('#base64-decode').on('click', () => {
    clearError();
    try {
      $output.val(decodeBase64($input.val().trim()));
    } catch (e) {
      showError('Invalid Base64 input.');
    }
  });

  $('#base64-copy').on('click', () => {
    copyToClipboard($output.val(), '#base64-copy');
  });

  $('#base64-clear').on('click', () => {
    clearError();
    $input.val('');
    $output.val('');
  });
}
