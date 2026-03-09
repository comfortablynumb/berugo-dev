import { copyToClipboard } from '../utils.js';

async function computeHash() {
  const input = $('#hash-input').val();
  const algorithm = $('#hash-algorithm').val();
  $('#hash-error').addClass('hidden').text('');
  $('#hash-output-wrap').addClass('hidden');

  if (!input) return;

  try {
    const data = new TextEncoder().encode(input);
    const buffer = await crypto.subtle.digest(algorithm, data);
    const hex = Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    $('#hash-output').val(hex);
    $('#hash-output-wrap').removeClass('hidden');
  } catch (e) {
    $('#hash-error').removeClass('hidden').text(`Error: ${e.message}`);
  }
}

export function initHash() {
  $('#hash-btn').on('click', computeHash);
  $('#hash-input').on('keydown', e => { if (e.ctrlKey && e.key === 'Enter') computeHash(); });
  $('#hash-algorithm').on('change', () => { if ($('#hash-input').val()) computeHash(); });
  $('#hash-copy-btn').on('click', () => copyToClipboard($('#hash-output').val(), '#hash-copy-btn'));
}
