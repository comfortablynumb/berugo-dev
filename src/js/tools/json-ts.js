import { copyToClipboard } from '../utils.js';

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isSafeKey(key) {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

function getType(value, name, interfaces, usedNames) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = getType(value[0], name + 'Item', interfaces, usedNames);
    return `${itemType}[]`;
  }

  if (typeof value === 'object') {
    return buildInterface(value, name, interfaces, usedNames);
  }

  return 'unknown';
}

function buildInterface(obj, name, interfaces, usedNames) {
  let ifaceName = toPascalCase(name);

  if (usedNames.has(ifaceName)) {
    let i = 2;
    while (usedNames.has(ifaceName + i)) i++;
    ifaceName = ifaceName + i;
  }

  usedNames.add(ifaceName);

  const lines = Object.entries(obj).map(([key, val]) => {
    const type = getType(val, key, interfaces, usedNames);
    const safeKey = isSafeKey(key) ? key : `"${key}"`;
    return `  ${safeKey}: ${type};`;
  });

  interfaces.push(`interface ${ifaceName} {\n${lines.join('\n')}\n}`);
  return ifaceName;
}

function convert(input) {
  const data = JSON.parse(input);
  const interfaces = [];
  const usedNames = new Set();

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      buildInterface(data[0], 'Root', interfaces, usedNames);
    } else {
      const type = data.length > 0 ? getType(data[0], 'Root', interfaces, usedNames) : 'unknown';
      interfaces.push(`type Root = ${type}[];`);
    }
  } else if (typeof data === 'object' && data !== null) {
    buildInterface(data, 'Root', interfaces, usedNames);
  } else {
    interfaces.push(`type Root = ${getType(data, 'Root', interfaces, usedNames)};`);
  }

  return interfaces.join('\n\n');
}

export function initJsonTs() {
  const $input = $('#json-ts-input');
  const $output = $('#json-ts-output');
  const $error = $('#json-ts-error');

  function run() {
    const text = $input.val().trim();

    if (!text) {
      $output.val('');
      $error.addClass('hidden');
      return;
    }

    try {
      $output.val(convert(text));
      $error.addClass('hidden');
    } catch (e) {
      $error.text('Invalid JSON: ' + e.message).removeClass('hidden');
      $output.val('');
    }
  }

  $('#json-ts-btn').on('click', run);
  $('#json-ts-copy').on('click', () => copyToClipboard($output.val(), '#json-ts-copy'));
  $('#json-ts-clear').on('click', () => {
    $input.val('');
    $output.val('');
    $error.addClass('hidden');
  });
}
