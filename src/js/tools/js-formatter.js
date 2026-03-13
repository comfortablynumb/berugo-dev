import { copyToClipboard } from '../utils.js';

function formatJs(input) {
  let result = '';
  let depth = 0;
  let inSingleString = false;
  let inDoubleString = false;
  let inTemplate = false;
  let inLineComment = false;
  let inBlockComment = false;
  let i = 0;

  const indent = () => '  '.repeat(depth);

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];
    const prev = i > 0 ? input[i - 1] : '';

    if (inLineComment) {
      result += ch;

      if (ch === '\n') inLineComment = false;

      i++;
      continue;
    }

    if (inBlockComment) {
      result += ch;

      if (ch === '*' && next === '/') {
        result += '/';
        i += 2;
        inBlockComment = false;
      } else {
        i++;
      }
      continue;
    }

    if (inSingleString) {
      result += ch;

      if (ch === "'" && prev !== '\\') inSingleString = false;

      i++;
      continue;
    }

    if (inDoubleString) {
      result += ch;

      if (ch === '"' && prev !== '\\') inDoubleString = false;

      i++;
      continue;
    }

    if (inTemplate) {
      result += ch;

      if (ch === '`' && prev !== '\\') inTemplate = false;

      i++;
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      result += '//';
      i += 2;
      continue;
    }

    if (ch === '/' && next === '*') {
      inBlockComment = true;
      result += '/*';
      i += 2;
      continue;
    }

    if (ch === "'") { inSingleString = true; result += ch; i++; continue; }
    if (ch === '"') { inDoubleString = true; result += ch; i++; continue; }
    if (ch === '`') { inTemplate = true; result += ch; i++; continue; }

    if (ch === '{' || ch === '[' || ch === '(') {
      result += ch + '\n';
      depth++;
      result += indent();
      i++;
      skipWhitespace();
      continue;
    }

    if (ch === '}' || ch === ']' || ch === ')') {
      depth = Math.max(0, depth - 1);
      result = result.trimEnd() + '\n' + indent() + ch;
      i++;
      continue;
    }

    if (ch === ';') {
      result += ';\n' + indent();
      i++;
      skipWhitespace();
      continue;
    }

    if (ch === ',') {
      result += ',\n' + indent();
      i++;
      skipWhitespace();
      continue;
    }

    if (/\s/.test(ch)) {
      if (result.length > 0 && !/\s/.test(result[result.length - 1])) {
        result += ' ';
      }

      i++;
      continue;
    }

    result += ch;
    i++;
  }

  function skipWhitespace() {
    while (i < input.length && /[ \t]/.test(input[i])) i++;

    if (i < input.length && input[i] === '\n') i++;
  }

  return result
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim() + '\n';
}

function minifyJs(input) {
  let result = '';
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let inLine = false;
  let inBlock = false;
  let i = 0;

  while (i < input.length) {
    const ch = input[i];
    const next = input[i + 1];
    const prev = i > 0 ? input[i - 1] : '';

    if (inLine) {
      if (ch === '\n') { inLine = false; result += '\n'; }

      i++;
      continue;
    }

    if (inBlock) {
      if (ch === '*' && next === '/') { inBlock = false; i += 2; }
      else i++;
      continue;
    }

    if (inSingle) {
      result += ch;

      if (ch === "'" && prev !== '\\') inSingle = false;

      i++;
      continue;
    }

    if (inDouble) {
      result += ch;

      if (ch === '"' && prev !== '\\') inDouble = false;

      i++;
      continue;
    }

    if (inTemplate) {
      result += ch;

      if (ch === '`' && prev !== '\\') inTemplate = false;

      i++;
      continue;
    }

    if (ch === '/' && next === '/') { inLine = true; i += 2; continue; }
    if (ch === '/' && next === '*') { inBlock = true; i += 2; continue; }
    if (ch === "'") { inSingle = true; result += ch; i++; continue; }
    if (ch === '"') { inDouble = true; result += ch; i++; continue; }
    if (ch === '`') { inTemplate = true; result += ch; i++; continue; }

    if (/\s/.test(ch)) {
      const lastChar = result[result.length - 1] || '';
      const nextNonWs = input.slice(i).match(/\S/);

      if (nextNonWs && needsSpace(lastChar, nextNonWs[0])) {
        result += ' ';
      }

      i++;
      continue;
    }

    result += ch;
    i++;
  }

  return result.trim();
}

function needsSpace(left, right) {
  if (!left || !right) return false;

  const idChar = /[a-zA-Z0-9_$]/;
  return idChar.test(left) && idChar.test(right);
}

export function initJsFormatter() {
  const $input = $('#jsf-input');
  const $output = $('#jsf-output');
  const $error = $('#jsf-error');

  function clearError() { $error.text('').addClass('hidden'); }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#jsf-format').on('click', () => {
    clearError();
    const input = $input.val();

    if (!input.trim()) return;

    try {
      $output.val(formatJs(input));
    } catch (e) {
      showError('Format error: ' + e.message);
    }
  });

  $('#jsf-minify').on('click', () => {
    clearError();
    const input = $input.val();

    if (!input.trim()) return;

    try {
      $output.val(minifyJs(input));
    } catch (e) {
      showError('Minify error: ' + e.message);
    }
  });

  $('#jsf-copy').on('click', () => copyToClipboard($output.val(), '#jsf-copy'));
  $('#jsf-clear').on('click', () => { clearError(); $input.val(''); $output.val(''); });
}
