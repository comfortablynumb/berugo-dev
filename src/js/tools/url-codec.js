import { copyToClipboard } from '../utils.js';

export function initUrlCodec() {
  const $input = $('#url-input');
  const $output = $('#url-output');
  const $error = $('#url-error');

  function clearError() {
    $error.text('').addClass('hidden');
  }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#url-encode').on('click', () => {
    clearError();
    try {
      $output.val(encodeURIComponent($input.val()));
    } catch (e) {
      showError('Encode failed: ' + e.message);
    }
  });

  $('#url-decode').on('click', () => {
    clearError();
    try {
      $output.val(decodeURIComponent($input.val()));
    } catch (e) {
      showError('Invalid URL-encoded input.');
    }
  });

  $('#url-copy').on('click', () => {
    copyToClipboard($output.val(), '#url-copy');
  });

  $('#url-clear').on('click', () => {
    clearError();
    $input.val('');
    $output.val('');
  });
}
