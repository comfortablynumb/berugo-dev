function diffValues(a, b, path) {
  const aIsObj = a !== null && typeof a === 'object' && !Array.isArray(a);
  const bIsObj = b !== null && typeof b === 'object' && !Array.isArray(b);
  const aIsArr = Array.isArray(a);
  const bIsArr = Array.isArray(b);

  if (aIsArr && bIsArr) return diffArrays(a, b, path);
  if (aIsObj && bIsObj) return diffObjects(a, b, path);

  if (JSON.stringify(a) === JSON.stringify(b)) {
    return [{ path, type: 'unchanged', old: a, new: b }];
  }

  return [{ path, type: 'changed', old: a, new: b }];
}

function diffObjects(a, b, path) {
  const results = [];
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const childPath = path ? `${path}.${key}` : key;

    if (!(key in a)) {
      results.push({ path: childPath, type: 'added', new: b[key] });
    } else if (!(key in b)) {
      results.push({ path: childPath, type: 'removed', old: a[key] });
    } else {
      results.push(...diffValues(a[key], b[key], childPath));
    }
  }

  return results;
}

function diffArrays(a, b, path) {
  const results = [];
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const childPath = `${path}[${i}]`;

    if (i >= a.length) {
      results.push({ path: childPath, type: 'added', new: b[i] });
    } else if (i >= b.length) {
      results.push({ path: childPath, type: 'removed', old: a[i] });
    } else {
      results.push(...diffValues(a[i], b[i], childPath));
    }
  }

  return results;
}

function shortVal(v) {
  const s = JSON.stringify(v);
  return s.length > 60 ? s.slice(0, 57) + '…' : s;
}

function renderEntry(d) {
  if (d.type === 'unchanged') return '';

  const pathHtml = `<span class="font-mono text-xs text-gray-500 dark:text-gray-400">${d.path || '(root)'}</span>`;

  if (d.type === 'added') {
    return `<div class="flex gap-2 items-start py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span class="text-green-500 font-bold shrink-0">+</span>${pathHtml}
      <span class="font-mono text-xs text-green-700 dark:text-green-400 ml-auto">${shortVal(d.new)}</span>
    </div>`;
  }

  if (d.type === 'removed') {
    return `<div class="flex gap-2 items-start py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span class="text-red-500 font-bold shrink-0">−</span>${pathHtml}
      <span class="font-mono text-xs text-red-700 dark:text-red-400 ml-auto line-through">${shortVal(d.old)}</span>
    </div>`;
  }

  return `<div class="flex gap-2 items-start py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span class="text-yellow-500 font-bold shrink-0">~</span>${pathHtml}
    <span class="font-mono text-xs ml-auto">
      <span class="text-red-600 dark:text-red-400 line-through">${shortVal(d.old)}</span>
      <span class="text-gray-400 mx-1">→</span>
      <span class="text-green-600 dark:text-green-400">${shortVal(d.new)}</span>
    </span>
  </div>`;
}

function renderSummary(diffs) {
  const added = diffs.filter(d => d.type === 'added').length;
  const removed = diffs.filter(d => d.type === 'removed').length;
  const changed = diffs.filter(d => d.type === 'changed').length;

  return `<span class="text-green-600 dark:text-green-400">+${added} added</span> · ` +
    `<span class="text-red-600 dark:text-red-400">−${removed} removed</span> · ` +
    `<span class="text-yellow-600 dark:text-yellow-400">~${changed} changed</span>`;
}

export function initJsonDiff() {
  const $a = $('#jdiff-a');
  const $b = $('#jdiff-b');
  const $error = $('#jdiff-error');
  const $result = $('#jdiff-result');
  const $summary = $('#jdiff-summary');
  const $output = $('#jdiff-output');
  const $unchanged = $('#jdiff-show-unchanged');

  function run() {
    $error.addClass('hidden');
    $result.addClass('hidden');

    try {
      const dataA = JSON.parse($a.val());
      const dataB = JSON.parse($b.val());
      const diffs = diffValues(dataA, dataB, '');
      const showUnchanged = $unchanged.is(':checked');
      const visible = showUnchanged ? diffs : diffs.filter(d => d.type !== 'unchanged');

      $summary.html(renderSummary(diffs));
      $output.html(visible.map(renderEntry).join('') || '<p class="text-sm text-gray-400 py-2 italic">No differences found.</p>');
      $result.removeClass('hidden');
    } catch (e) {
      $error.text('Parse error: ' + e.message).removeClass('hidden');
    }
  }

  $('#jdiff-btn').on('click', run);
  $unchanged.on('change', run);
  $('#jdiff-clear').on('click', () => {
    $a.val(''); $b.val('');
    $error.addClass('hidden');
    $result.addClass('hidden');
  });
}
