import { copyToClipboard } from '../utils.js';

function generateUuids() {
  const count = Math.min(Math.max(parseInt($('#uuid-count').val()) || 1, 1), 100);
  const uuids = Array.from({ length: count }, () => crypto.randomUUID());
  $('#uuid-output').val(uuids.join('\n'));
}

export function initUuid() {
  $('#uuid-generate-btn').on('click', generateUuids);
  $('#uuid-copy-btn').on('click', () => copyToClipboard($('#uuid-output').val(), '#uuid-copy-btn'));
  generateUuids();
}
