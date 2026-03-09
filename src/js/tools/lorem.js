import { copyToClipboard } from '../utils.js';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

function pick() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function sentence() {
  const words = Array.from({ length: 6 + Math.floor(Math.random() * 10) }, pick);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function paragraph() {
  return Array.from({ length: 3 + Math.floor(Math.random() * 4) }, sentence).join(' ');
}

function generate() {
  const type = $('#lorem-type').val();
  const count = Math.min(Math.max(parseInt($('#lorem-count').val()) || 3, 1), 100);

  let output;

  if (type === 'words') output = Array.from({ length: count }, pick).join(' ');
  else if (type === 'sentences') output = Array.from({ length: count }, sentence).join(' ');
  else output = Array.from({ length: count }, paragraph).join('\n\n');

  $('#lorem-output').val(output);
}

export function initLorem() {
  $('#lorem-generate-btn').on('click', generate);
  $('#lorem-copy-btn').on('click', () => copyToClipboard($('#lorem-output').val(), '#lorem-copy-btn'));
  generate();
}
