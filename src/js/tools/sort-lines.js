import { copyToClipboard } from '../utils.js';

function getLines(text) {
  return text.split('\n');
}

function sortAZ(lines) {
  return [...lines].sort((a, b) => a.localeCompare(b));
}

function sortZA(lines) {
  return [...lines].sort((a, b) => b.localeCompare(a));
}

function reverseLine(lines) {
  return [...lines].reverse();
}

function shuffle(lines) {
  const arr = [...lines];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function dedupe(lines) {
  return [...new Set(lines)];
}

function removeBlank(lines) {
  return lines.filter(l => l.trim() !== '');
}

function applyOp(op) {
  const input = $('#sort-input').val();
  const lines = getLines(input);
  let result;

  if (op === 'az') result = sortAZ(lines);
  else if (op === 'za') result = sortZA(lines);
  else if (op === 'reverse') result = reverseLine(lines);
  else if (op === 'shuffle') result = shuffle(lines);
  else if (op === 'dedupe') result = dedupe(lines);
  else if (op === 'blank') result = removeBlank(lines);
  else return;

  $('#sort-output').val(result.join('\n'));
  updateStats(result);
}

function updateStats(lines) {
  const total = lines.length;
  const nonBlank = lines.filter(l => l.trim()).length;
  $('#sort-stats').text(`${total} lines (${nonBlank} non-blank)`);
}

export function initSortLines() {
  $('#sort-az').on('click', () => applyOp('az'));
  $('#sort-za').on('click', () => applyOp('za'));
  $('#sort-reverse').on('click', () => applyOp('reverse'));
  $('#sort-shuffle').on('click', () => applyOp('shuffle'));
  $('#sort-dedupe').on('click', () => applyOp('dedupe'));
  $('#sort-blank').on('click', () => applyOp('blank'));

  $('#sort-copy').on('click', () => copyToClipboard($('#sort-output').val(), '#sort-copy'));

  $('#sort-clear').on('click', () => {
    $('#sort-input').val('');
    $('#sort-output').val('');
    $('#sort-stats').text('');
  });
}
