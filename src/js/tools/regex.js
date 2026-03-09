function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getFlags() {
  return ['g', 'i', 'm', 's']
    .filter(f => $(`#regex-flag-${f}`).is(':checked'))
    .join('');
}

function renderMatches(matches) {
  const $list = $('#regex-match-list').empty();
  $('#regex-match-count').text(`${matches.length} match${matches.length !== 1 ? 'es' : ''}`);

  if (matches.length === 0) {
    $list.append('<p class="text-gray-400 dark:text-gray-500 text-sm italic">No matches found.</p>');
    return;
  }

  matches.forEach((m, i) => {
    const groups = m.slice(1)
      .map((g, gi) => `<span class="text-gray-400">Group ${gi + 1}:</span> <span class="text-orange-500">${escapeHtml(g ?? '<i>undefined</i>')}</span>`)
      .join(' &nbsp;·&nbsp; ');
    $list.append(`
      <div class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-sm font-mono">
        <span class="text-indigo-500">Match ${i + 1}</span>
        <span class="text-gray-400 ml-2">index ${m.index}</span>:
        <span class="text-green-600 dark:text-green-400 ml-1">${escapeHtml(m[0])}</span>
        ${groups ? `<div class="text-xs mt-1 text-gray-400">${groups}</div>` : ''}
      </div>`);
  });
}

function testRegex() {
  const pattern = $('#regex-pattern').val();
  const testStr = $('#regex-test-str').val();
  $('#regex-error').addClass('hidden').text('');
  $('#regex-matches').addClass('hidden');

  if (!pattern) return;

  let regex;
  try {
    regex = new RegExp(pattern, getFlags());
  } catch (e) {
    $('#regex-error').removeClass('hidden').text(`Invalid regex: ${e.message}`);
    return;
  }

  const matches = [];
  if (regex.global) {
    let m;
    while ((m = regex.exec(testStr)) !== null) {
      matches.push(m);
      if (m.index === regex.lastIndex) regex.lastIndex++;
    }
  } else {
    const m = regex.exec(testStr);
    if (m) matches.push(m);
  }

  renderMatches(matches);
  $('#regex-matches').removeClass('hidden');
}

export function initRegex() {
  $('#regex-test-btn').on('click', testRegex);
  $('#regex-pattern, #regex-test-str').on('input', testRegex);
  $('#regex-flag-g, #regex-flag-i, #regex-flag-m, #regex-flag-s').on('change', testRegex);
}
