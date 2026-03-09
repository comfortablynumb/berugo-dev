function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function row(label, value) {
  return `<tr class="border-t border-gray-200 dark:border-gray-700">
    <td class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 w-28 shrink-0">${label}</td>
    <td class="px-4 py-2 font-mono text-sm break-all">${escapeHtml(value)}</td>
  </tr>`;
}

function renderComponents(url) {
  const fields = [
    ['Protocol', url.protocol],
    ['Host',     url.host],
    ['Hostname', url.hostname],
    ['Port',     url.port || '(default)'],
    ['Pathname', url.pathname],
    ['Hash',     url.hash || '(none)'],
  ];

  $('#urlp-components').html(fields.map(([l, v]) => row(l, v)).join(''));
}

function renderParams(url) {
  const params = [...url.searchParams.entries()];
  const $tbody = $('#urlp-params').empty();

  if (!params.length) {
    $tbody.html('<tr><td colspan="2" class="px-4 py-2 text-sm text-gray-400 italic">No query parameters</td></tr>');
    return;
  }

  params.forEach(([k, v]) => {
    $tbody.append(`<tr class="border-t border-gray-200 dark:border-gray-700">
      <td class="px-4 py-2 font-mono text-sm text-indigo-600 dark:text-indigo-400 break-all">${escapeHtml(k)}</td>
      <td class="px-4 py-2 font-mono text-sm break-all">${escapeHtml(v)}</td>
    </tr>`);
  });
}

function parseUrl() {
  const input = $('#urlp-input').val().trim();
  $('#urlp-error').addClass('hidden');
  $('#urlp-result').addClass('hidden');

  if (!input) return;

  let url;
  try {
    url = new URL(input);
  } catch {
    $('#urlp-error').removeClass('hidden').text('Invalid URL — make sure it includes a scheme (e.g. https://).');
    return;
  }

  renderComponents(url);
  renderParams(url);
  $('#urlp-result').removeClass('hidden');
}

export function initUrlParser() {
  $('#urlp-btn').on('click', parseUrl);
  $('#urlp-input').on('keydown', e => { if (e.key === 'Enter') parseUrl(); });
}
