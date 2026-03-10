import { copyToClipboard } from '../utils.js';

let jsYaml = null;

async function loadYaml() {
  if (jsYaml) return;
  const mod = await import('https://cdn.jsdelivr.net/npm/js-yaml@4/+esm');
  jsYaml = mod.default;
}

function yamlToJson(yamlStr) {
  const obj = jsYaml.load(yamlStr);
  return JSON.stringify(obj, null, 2);
}

function jsonToYaml(jsonStr) {
  const obj = JSON.parse(jsonStr);
  return jsYaml.dump(obj, { indent: 2 });
}

async function run(direction) {
  const $input = $('#yaml-input');
  const $output = $('#yaml-output');
  const $error = $('#yaml-error');

  if (!jsYaml) {
    try {
      await loadYaml();
    } catch (e) {
      $error.text('Failed to load YAML library: ' + e.message).removeClass('hidden');
      return;
    }
  }

  $error.addClass('hidden');

  try {
    const result = direction === 'yaml2json'
      ? yamlToJson($input.val())
      : jsonToYaml($input.val());

    $output.val(result);
  } catch (e) {
    $error.text('Error: ' + e.message).removeClass('hidden');
    $output.val('');
  }
}

export function initYamlJson() {
  $('#yaml-to-json').on('click', () => run('yaml2json'));
  $('#json-to-yaml').on('click', () => run('json2yaml'));
  $('#yaml-copy').on('click', () => copyToClipboard($('#yaml-output').val(), '#yaml-copy'));

  $('#yaml-clear').on('click', () => {
    $('#yaml-input').val('');
    $('#yaml-output').val('');
    $('#yaml-error').addClass('hidden');
  });
}
