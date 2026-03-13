import { copyToClipboard } from '../utils.js';

function formatCss(input) {
  let result = '';
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inComment = false;
  let i = 0;

  const indent = () => '  '.repeat(depth);

  while (i < input.length) {
    if (inComment) {
      result += input[i];

      if (input[i] === '*' && input[i + 1] === '/') {
        result += '/\n' + indent();
        i += 2;
        inComment = false;
      } else {
        i++;
      }
      continue;
    }

    if (inString) {
      result += input[i];

      if (input[i] === stringChar && input[i - 1] !== '\\') {
        inString = false;
      }

      i++;
      continue;
    }

    if (input[i] === '/' && input[i + 1] === '*') {
      result += '\n' + indent() + '/*';
      i += 2;
      inComment = true;
      continue;
    }

    if (input[i] === '"' || input[i] === "'") {
      inString = true;
      stringChar = input[i];
      result += input[i];
      i++;
      continue;
    }

    if (input[i] === '{') {
      result = result.trimEnd() + ' {\n';
      depth++;
      result += indent();
      i++;
      skipWhitespace();
      continue;
    }

    if (input[i] === '}') {
      depth = Math.max(0, depth - 1);
      result = result.trimEnd() + '\n' + indent() + '}\n\n' + indent();
      i++;
      skipWhitespace();
      continue;
    }

    if (input[i] === ';') {
      result += ';\n' + indent();
      i++;
      skipWhitespace();
      continue;
    }

    result += input[i];
    i++;
  }

  function skipWhitespace() {
    while (i < input.length && /\s/.test(input[i])) i++;
  }

  return result
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim() + '\n';
}

function minifyCss(input) {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

export function initCssFormatter() {
  const $input = $('#css-input');
  const $output = $('#css-output');
  const $error = $('#css-error');

  function clearError() { $error.text('').addClass('hidden'); }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#css-format').on('click', () => {
    clearError();
    const input = $input.val();

    if (!input.trim()) return;

    try {
      $output.val(formatCss(input));
    } catch (e) {
      showError('Format error: ' + e.message);
    }
  });

  $('#css-minify').on('click', () => {
    clearError();
    const input = $input.val();

    if (!input.trim()) return;

    $output.val(minifyCss(input));
  });

  $('#css-copy').on('click', () => copyToClipboard($output.val(), '#css-copy'));
  $('#css-clear').on('click', () => { clearError(); $input.val(''); $output.val(''); });
}
