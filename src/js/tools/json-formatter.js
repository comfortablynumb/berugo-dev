import { copyToClipboard } from '../utils.js';

function processJson(pretty) {
  const input = $('#json-input').val().trim();
  $('#json-error').addClass('hidden').text('');

  if (!input) return;

  try {
    const parsed = JSON.parse(input);
    const result = pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
    $('#json-output').val(result);
  } catch (e) {
    $('#json-error').removeClass('hidden').text(`Invalid JSON: ${e.message}`);
  }
}

function clearJson() {
  $('#json-input').val('');
  $('#json-error').addClass('hidden').text('');
  $('#json-output').val('');
}

export function initJsonFormatter() {
  $('#json-format-btn').on('click', () => processJson(true));
  $('#json-minify-btn').on('click', () => processJson(false));
  $('#json-clear-btn').on('click', clearJson);
  $('#json-copy-btn').on('click', () => copyToClipboard($('#json-output').val(), '#json-copy-btn'));
}
