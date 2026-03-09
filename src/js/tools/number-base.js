import { copyToClipboard } from '../utils.js';

const BASES = [
  { id: 'nb-bin', base: 2,  label: 'Binary' },
  { id: 'nb-oct', base: 8,  label: 'Octal' },
  { id: 'nb-dec', base: 10, label: 'Decimal' },
  { id: 'nb-hex', base: 16, label: 'Hex' },
];

function updateAll(n, sourceId) {
  BASES.forEach(({ id, base }) => {
    if (id !== sourceId) $(`#${id}`).val(n.toString(base).toUpperCase());
  });
  $('#nb-error').addClass('hidden');
}

function clearAll() {
  BASES.forEach(({ id }) => $(`#${id}`).val(''));
  $('#nb-error').addClass('hidden');
}

function handleInput(value, base, sourceId) {
  if (!value.trim()) {
    clearAll();
    return;
  }

  const n = parseInt(value.trim(), base);

  if (isNaN(n) || n < 0) {
    $('#nb-error').removeClass('hidden').text('Invalid number for this base (non-negative integers only).');
    return;
  }

  updateAll(n, sourceId);
}

export function initNumberBase() {
  BASES.forEach(({ id, base }) => {
    $(`#${id}`).on('input', function () { handleInput(this.value, base, id); });

    $(`#${id}-copy`).on('click', function () {
      copyToClipboard($(`#${id}`).val(), `#${id}-copy`);
    });
  });
}
