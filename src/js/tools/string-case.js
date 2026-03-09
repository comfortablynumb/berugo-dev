import { copyToClipboard } from '../utils.js';

const CASES = [
  { id: 'case-camel',       label: 'camelCase' },
  { id: 'case-pascal',      label: 'PascalCase' },
  { id: 'case-snake',       label: 'snake_case' },
  { id: 'case-kebab',       label: 'kebab-case' },
  { id: 'case-upper-snake', label: 'UPPER_SNAKE' },
  { id: 'case-title',       label: 'Title Case' },
  { id: 'case-lower',       label: 'lowercase' },
];

function capitalize(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function toWords(input) {
  return input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean);
}

function buildCases(words) {
  return {
    'case-camel':       words[0] + words.slice(1).map(capitalize).join(''),
    'case-pascal':      words.map(capitalize).join(''),
    'case-snake':       words.join('_'),
    'case-kebab':       words.join('-'),
    'case-upper-snake': words.join('_').toUpperCase(),
    'case-title':       words.map(capitalize).join(' '),
    'case-lower':       words.join(' '),
  };
}

function convertAll() {
  const input = $('#case-input').val();

  if (!input.trim()) {
    CASES.forEach(({ id }) => $(`#${id}`).val(''));
    return;
  }

  const cases = buildCases(toWords(input));
  CASES.forEach(({ id }) => $(`#${id}`).val(cases[id]));
}

export function initStringCase() {
  $('#case-input').on('input', convertAll);

  CASES.forEach(({ id }) => {
    $(`#${id}-copy`).on('click', function () {
      copyToClipboard($(`#${id}`).val(), `#${id}-copy`);
    });
  });
}
