import { copyToClipboard } from '../utils.js';

function escapeString(raw) {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/[\x00-\x1f\x7f]/g, ch => {
      return '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
    });
}

function unescapeString(escaped) {
  return escaped.replace(/\\(u[0-9a-fA-F]{4}|[\\/"nrtbf])/g, (_, seq) => {
    if (seq === 'n') return '\n';
    if (seq === 'r') return '\r';
    if (seq === 't') return '\t';
    if (seq === 'b') return '\b';
    if (seq === 'f') return '\f';
    if (seq === '\\') return '\\';
    if (seq === '"') return '"';
    if (seq === '/') return '/';
    if (seq.startsWith('u')) return String.fromCharCode(parseInt(seq.slice(1), 16));
    return seq;
  });
}

export function initStringEscape() {
  const $input = $('#str-escape-input');
  const $output = $('#str-escape-output');
  const $error = $('#str-escape-error');

  function clearError() {
    $error.text('').addClass('hidden');
  }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#str-escape-btn').on('click', () => {
    clearError();
    $output.val(escapeString($input.val()));
  });

  $('#str-unescape-btn').on('click', () => {
    clearError();

    try {
      $output.val(unescapeString($input.val()));
    } catch (e) {
      showError('Unescape failed: ' + e.message);
    }
  });

  $('#str-escape-copy').on('click', () => copyToClipboard($output.val(), '#str-escape-copy'));

  $('#str-escape-clear').on('click', () => {
    clearError();
    $input.val('');
    $output.val('');
  });
}
