import { copyToClipboard } from '../utils.js';
import { format as sqlFormat } from 'https://cdn.jsdelivr.net/npm/sql-formatter@15/+esm';

function formatSql(input, language) {
  return sqlFormat(input, {
    language,
    tabWidth: 2,
    keywordCase: 'upper',
  });
}

function minifySql(input) {
  return input
    .replace(/--[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function initSqlFormatter() {
  const $input = $('#sql-input');
  const $output = $('#sql-output');
  const $error = $('#sql-error');
  const $lang = $('#sql-lang');

  function clearError() { $error.text('').addClass('hidden'); }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#sql-format').on('click', () => {
    clearError();
    const input = $input.val().trim();

    if (!input) return;

    try {
      $output.val(formatSql(input, $lang.val()));
    } catch (e) {
      showError('Format error: ' + e.message);
    }
  });

  $('#sql-minify').on('click', () => {
    clearError();
    const input = $input.val().trim();

    if (!input) return;

    $output.val(minifySql(input));
  });

  $('#sql-copy').on('click', () => copyToClipboard($output.val(), '#sql-copy'));
  $('#sql-clear').on('click', () => { clearError(); $input.val(''); $output.val(''); });
}
