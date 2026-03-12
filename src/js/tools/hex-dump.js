import { copyToClipboard } from '../utils.js';

function byteToHex(b) {
  return b.toString(16).padStart(2, '0');
}

function toPrintable(b) {
  return b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.';
}

function buildLine(offset, bytes, width) {
  const hexPart = bytes.map(byteToHex).join(' ').padEnd(width * 3 - 1, ' ');
  const asciiPart = bytes.map(toPrintable).join('');

  return `${offset.toString(16).padStart(8, '0')}  ${hexPart}  |${asciiPart}|`;
}

function generateDump(bytes, width) {
  if (!bytes.length) return '(empty)';

  const lines = [];

  for (let i = 0; i < bytes.length; i += width) {
    lines.push(buildLine(i, [...bytes.slice(i, i + width)], width));
  }

  return lines.join('\n');
}

function renderDump() {
  const text = $('#hexdump-input').val();
  const width = parseInt($('#hexdump-width').val()) || 16;
  const bytes = new TextEncoder().encode(text);

  $('#hexdump-output').val(generateDump(bytes, width));
  $('#hexdump-stats').text(`${bytes.length} bytes · ${text.length} chars`);
}

export function initHexDump() {
  $('#hexdump-input').on('input', renderDump);
  $('#hexdump-width').on('change', renderDump);
  $('#hexdump-copy').on('click', () => copyToClipboard($('#hexdump-output').val(), '#hexdump-copy'));
}
