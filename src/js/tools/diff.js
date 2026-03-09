function buildDp(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  return dp;
}

function backtrack(dp, a, b) {
  const result = [];
  let i = a.length, j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ type: 'equal', value: a[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'add', value: b[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'remove', value: a[i - 1] });
      i--;
    }
  }

  return result;
}

function diffLines(textA, textB) {
  const a = textA.split('\n');
  const b = textB.split('\n');
  return backtrack(buildDp(a, b), a, b);
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderLine({ type, value }) {
  const v = escapeHtml(value);

  if (type === 'add') {
    return `<div class="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-px font-mono text-sm whitespace-pre"><span class="select-none text-green-500 mr-2">+</span>${v}</div>`;
  }

  if (type === 'remove') {
    return `<div class="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-3 py-px font-mono text-sm whitespace-pre"><span class="select-none text-red-500 mr-2">-</span>${v}</div>`;
  }

  return `<div class="px-3 py-px font-mono text-sm text-gray-500 dark:text-gray-400 whitespace-pre"><span class="select-none mr-2"> </span>${v}</div>`;
}

function runDiff() {
  const diff = diffLines($('#diff-a').val(), $('#diff-b').val());
  const added = diff.filter(d => d.type === 'add').length;
  const removed = diff.filter(d => d.type === 'remove').length;

  $('#diff-stats').html(
    `<span class="text-green-600 dark:text-green-400">+${added} added</span>, ` +
    `<span class="text-red-600 dark:text-red-400">-${removed} removed</span>`
  );
  $('#diff-output').html(diff.map(renderLine).join(''));
  $('#diff-result').removeClass('hidden');
}

export function initDiff() {
  $('#diff-btn').on('click', runDiff);
}
