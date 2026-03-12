import { copyToClipboard } from '../utils.js';

const PERMISSIONS = [
  { id: 'ur', bit: 0o400 },
  { id: 'uw', bit: 0o200 },
  { id: 'ux', bit: 0o100 },
  { id: 'gr', bit: 0o040 },
  { id: 'gw', bit: 0o020 },
  { id: 'gx', bit: 0o010 },
  { id: 'or', bit: 0o004 },
  { id: 'ow', bit: 0o002 },
  { id: 'ox', bit: 0o001 },
];

function readOctalValue() {
  return PERMISSIONS.reduce((acc, p) => acc | ($(`#chmod-${p.id}`).is(':checked') ? p.bit : 0), 0);
}

function toSymbolic(octal) {
  return PERMISSIONS.map(p => (octal & p.bit) ? p.id[1] : '-').join('');
}

function updateDisplay() {
  const octal = readOctalValue();
  const octalStr = octal.toString(8).padStart(3, '0');
  const sym = `-${toSymbolic(octal)}`;

  $('#chmod-octal').val(octalStr);
  $('#chmod-symbolic').val(sym);
  $('#chmod-cmd').val(`chmod ${octalStr} <file>`);
}

function setFromOctal(str) {
  const val = parseInt(str, 8);

  if (isNaN(val) || val < 0 || val > 0o777) return;

  PERMISSIONS.forEach(p => $(`#chmod-${p.id}`).prop('checked', !!(val & p.bit)));
  updateDisplay();
}

function setFromSymbolic(str) {
  const cleaned = str.replace(/^[-d]/, '');

  if (cleaned.length !== 9) return;

  PERMISSIONS.forEach((p, i) => $(`#chmod-${p.id}`).prop('checked', cleaned[i] !== '-'));
  updateDisplay();
}

export function initChmod() {
  setFromOctal('644');

  PERMISSIONS.forEach(p => $(`#chmod-${p.id}`).on('change', updateDisplay));

  $('#chmod-octal').on('input', function () { setFromOctal($(this).val()); });
  $('#chmod-symbolic').on('input', function () { setFromSymbolic($(this).val()); });

  $('#chmod-copy-octal').on('click', () => copyToClipboard($('#chmod-octal').val(), '#chmod-copy-octal'));
  $('#chmod-copy-sym').on('click', () => copyToClipboard($('#chmod-symbolic').val(), '#chmod-copy-sym'));
  $('#chmod-copy-cmd').on('click', () => copyToClipboard($('#chmod-cmd').val(), '#chmod-copy-cmd'));
}
