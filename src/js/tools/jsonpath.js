import { copyToClipboard, syntaxHighlightJson } from '../utils.js';
import { JSONPath } from 'https://cdn.jsdelivr.net/npm/jsonpath-plus@10/+esm';

function evaluate(jsonStr, path) {
  const data = JSON.parse(jsonStr);
  return JSONPath({ path, json: data, resultType: 'value' });
}

export function initJsonPath() {
  const $json = $('#jp-json');
  const $path = $('#jp-path');
  const $output = $('#jp-output');
  const $error = $('#jp-error');
  const $count = $('#jp-count');

  function run() {
    $error.text('').addClass('hidden');
    $count.text('');
    const jsonStr = $json.val().trim();
    const path = $path.val().trim();

    if (!jsonStr || !path) {
      $output.html('');
      return;
    }

    try {
      const results = evaluate(jsonStr, path);
      $count.text(`${results.length} match${results.length !== 1 ? 'es' : ''}`);
      $output.html(syntaxHighlightJson(results));
    } catch (e) {
      $error.text(e.message).removeClass('hidden');
      $output.html('');
    }
  }

  $('#jp-evaluate').on('click', run);

  $path.on('input', () => {
    if ($json.val().trim() && $path.val().trim()) run();
  });

  $('#jp-copy').on('click', () => {
    const jsonStr = $json.val().trim();
    const path = $path.val().trim();

    if (!jsonStr || !path) return;

    try {
      const results = evaluate(jsonStr, path);
      copyToClipboard(JSON.stringify(results, null, 2), '#jp-copy');
    } catch (_) { /* ignore */ }
  });

  $('#jp-clear').on('click', () => {
    $error.text('').addClass('hidden');
    $count.text('');
    $json.val('');
    $path.val('');
    $output.html('');
  });
}
