import { copyToClipboard } from '../utils.js';

const VOID_ELEMENTS = new Set([
  'area','base','br','col','embed','hr','img','input',
  'link','meta','param','source','track','wbr',
]);

const INLINE_ELEMENTS = new Set([
  'a','abbr','acronym','b','bdo','big','br','button','cite',
  'code','dfn','em','i','img','input','kbd','label','map',
  'object','output','q','s','samp','select','small','span',
  'strong','sub','sup','textarea','time','tt','u','var',
]);

const RAW_ELEMENTS = new Set(['script','style','pre','code']);

function serializeHtmlNode(node, depth) {
  const pad = '  '.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? pad + text : '';
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!-- ${node.textContent.trim()} -->`;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.tagName.toLowerCase();
  const attrs = Array.from(node.attributes)
    .map(a => ` ${a.name}="${a.value}"`)
    .join('');

  if (VOID_ELEMENTS.has(tag)) {
    return `${pad}<${tag}${attrs}>`;
  }

  if (RAW_ELEMENTS.has(tag)) {
    const inner = node.innerHTML.trim();
    return inner
      ? `${pad}<${tag}${attrs}>\n${inner}\n${pad}</${tag}>`
      : `${pad}<${tag}${attrs}></${tag}>`;
  }

  const children = Array.from(node.childNodes)
    .map(c => serializeHtmlNode(c, depth + 1))
    .filter(s => s);

  if (children.length === 0) return `${pad}<${tag}${attrs}></${tag}>`;

  const isInline = INLINE_ELEMENTS.has(tag);
  if (isInline && children.length === 1 && !children[0].includes('\n')) {
    return `${pad}<${tag}${attrs}>${children[0].trim()}</${tag}>`;
  }

  return `${pad}<${tag}${attrs}>\n${children.join('\n')}\n${pad}</${tag}>`;
}

function formatHtml(htmlStr) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = htmlStr;

  const parts = Array.from(wrapper.childNodes)
    .map(n => serializeHtmlNode(n, 0))
    .filter(s => s);

  return parts.join('\n');
}

function minifyHtml(htmlStr) {
  return htmlStr
    .replace(/<!--.*?-->/gs, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

export function initHtmlBeautifier() {
  const $input = $('#html-b-input');
  const $output = $('#html-b-output');
  const $error = $('#html-b-error');

  function clearError() { $error.text('').addClass('hidden'); }

  $('#html-b-format').on('click', () => {
    clearError();

    try {
      $output.val(formatHtml($input.val()));
    } catch (e) {
      $error.text('Error: ' + e.message).removeClass('hidden');
      $output.val('');
    }
  });

  $('#html-b-minify').on('click', () => {
    clearError();
    $output.val(minifyHtml($input.val()));
  });

  $('#html-b-copy').on('click', () => copyToClipboard($output.val(), '#html-b-copy'));
  $('#html-b-clear').on('click', () => { clearError(); $input.val(''); $output.val(''); });
}
