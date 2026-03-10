import { copyToClipboard } from '../utils.js';

const VOID_TAGS = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

function serializeNode(node, depth) {
  const pad = '  '.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? pad + escapeXml(text) : '';
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent}-->`;
  }

  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent}]]>`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName;
  const attrs = Array.from(node.attributes)
    .map(a => ` ${a.name}="${escapeXml(a.value)}"`)
    .join('');

  const children = Array.from(node.childNodes)
    .map(c => serializeNode(c, depth + 1))
    .filter(s => s);

  if (children.length === 0) {
    return VOID_TAGS.has(tag.toLowerCase())
      ? `${pad}<${tag}${attrs} />`
      : `${pad}<${tag}${attrs}/>`;
  }

  if (children.length === 1 && !children[0].includes('\n')) {
    return `${pad}<${tag}${attrs}>${children[0].trim()}</${tag}>`;
  }

  return `${pad}<${tag}${attrs}>\n${children.join('\n')}\n${pad}</${tag}>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatXml(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    throw new Error(parseError.textContent.split('\n')[0]);
  }

  const lines = [];

  if (doc.xmlVersion) {
    lines.push(`<?xml version="${doc.xmlVersion}" encoding="UTF-8"?>`);
  }

  lines.push(serializeNode(doc.documentElement, 0));
  return lines.join('\n');
}

function minifyXml(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, 'text/xml');
  const parseError = doc.querySelector('parsererror');

  if (parseError) {
    throw new Error(parseError.textContent.split('\n')[0]);
  }

  return new XMLSerializer().serializeToString(doc).replace(/>\s+</g, '><').trim();
}

export function initXmlFormatter() {
  const $input = $('#xml-input');
  const $output = $('#xml-output');
  const $error = $('#xml-error');

  function clearError() { $error.text('').addClass('hidden'); }

  function showError(msg) {
    $error.text(msg).removeClass('hidden');
    $output.val('');
  }

  $('#xml-format').on('click', () => {
    clearError();

    try {
      $output.val(formatXml($input.val()));
    } catch (e) {
      showError('Parse error: ' + e.message);
    }
  });

  $('#xml-minify').on('click', () => {
    clearError();

    try {
      $output.val(minifyXml($input.val()));
    } catch (e) {
      showError('Parse error: ' + e.message);
    }
  });

  $('#xml-copy').on('click', () => copyToClipboard($output.val(), '#xml-copy'));
  $('#xml-clear').on('click', () => { clearError(); $input.val(''); $output.val(''); });
}
