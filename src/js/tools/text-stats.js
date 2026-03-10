function countBytes(str) {
  return new TextEncoder().encode(str).length;
}

function countWords(str) {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countSentences(str) {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]*[.!?]+/g);
  return matches ? matches.length : 1;
}

function readingTime(words) {
  const wpm = 200;
  const minutes = Math.ceil(words / wpm);
  if (minutes < 1) return '< 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} min`;
}

function computeStats(text) {
  const words = countWords(text);
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, '').length,
    words,
    sentences: countSentences(text),
    lines: text ? text.split('\n').length : 0,
    bytes: countBytes(text),
    readTime: readingTime(words),
  };
}

function renderStats(stats) {
  const rows = [
    ['Characters', stats.chars],
    ['Characters (no spaces)', stats.charsNoSpaces],
    ['Words', stats.words],
    ['Sentences', stats.sentences],
    ['Lines', stats.lines],
    ['Bytes (UTF-8)', stats.bytes],
    ['Reading time', stats.readTime],
  ];

  return rows.map(([label, value]) => `
    <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span class="text-gray-500 dark:text-gray-400 text-sm">${label}</span>
      <span class="font-mono font-semibold text-sm">${value}</span>
    </div>
  `).join('');
}

export function initTextStats() {
  const $input = $('#text-stats-input');
  const $output = $('#text-stats-output');

  function update() {
    const text = $input.val();
    const stats = computeStats(text);
    $output.html(renderStats(stats));
  }

  $input.on('input', update);

  $('#text-stats-clear').on('click', () => {
    $input.val('');
    update();
  });

  update();
}
