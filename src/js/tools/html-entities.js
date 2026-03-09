import { copyToClipboard } from '../utils.js';

const ENCODE_MAP = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
];

function encodeEntities(str) {
  return ENCODE_MAP.reduce((s, [re, entity]) => s.replace(re, entity), str);
}

function decodeEntities(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function clearAll() {
  $('#entities-input, #entities-output').val('');
}

export function initHtmlEntities() {
  $('#entities-encode-btn').on('click', () => {
    $('#entities-output').val(encodeEntities($('#entities-input').val()));
  });

  $('#entities-decode-btn').on('click', () => {
    $('#entities-output').val(decodeEntities($('#entities-input').val()));
  });

  $('#entities-clear-btn').on('click', clearAll);
  $('#entities-copy-btn').on('click', () => copyToClipboard($('#entities-output').val(), '#entities-copy-btn'));
}
