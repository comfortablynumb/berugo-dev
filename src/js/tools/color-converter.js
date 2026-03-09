import { copyToClipboard } from '../utils.js';

function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();

  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl({ r, g, b }) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;

  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;

  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb({ h, s, l }) {
  const sn = s / 100, ln = l / 100;

  if (sn === 0) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const hn = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255),
  };
}

function applyRgb(rgb) {
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);

  $('#color-hex').val(hex);
  $('#color-picker').val(hex);
  $('#color-swatch').css('background-color', hex);
  $('#color-r').val(rgb.r);
  $('#color-g').val(rgb.g);
  $('#color-b').val(rgb.b);
  $('#color-h').val(hsl.h);
  $('#color-s').val(hsl.s);
  $('#color-l').val(hsl.l);
}

function rgbValid({ r, g, b }) {
  return [r, g, b].every(v => !isNaN(v) && v >= 0 && v <= 255);
}

function hslValid({ h, s, l }) {
  return !isNaN(h) && !isNaN(s) && !isNaN(l) && h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100;
}

function getRgb() {
  return { r: parseInt($('#color-r').val()), g: parseInt($('#color-g').val()), b: parseInt($('#color-b').val()) };
}

function getHsl() {
  return { h: parseInt($('#color-h').val()), s: parseInt($('#color-s').val()), l: parseInt($('#color-l').val()) };
}

export function initColorConverter() {
  applyRgb({ r: 99, g: 102, b: 241 });

  $('#color-picker').on('input', function () {
    const rgb = hexToRgb(this.value);
    if (rgb) applyRgb(rgb);
  });

  $('#color-hex').on('input', function () {
    const rgb = hexToRgb(this.value);
    if (rgb) applyRgb(rgb);
  });

  $('#color-r, #color-g, #color-b').on('input', () => {
    const rgb = getRgb();
    if (rgbValid(rgb)) applyRgb(rgb);
  });

  $('#color-h, #color-s, #color-l').on('input', () => {
    const hsl = getHsl();
    if (hslValid(hsl)) applyRgb(hslToRgb(hsl));
  });

  $('#color-copy-hex').on('click', () => copyToClipboard($('#color-hex').val(), '#color-copy-hex'));

  $('#color-copy-rgb').on('click', () => {
    const { r, g, b } = getRgb();
    copyToClipboard(`rgb(${r}, ${g}, ${b})`, '#color-copy-rgb');
  });

  $('#color-copy-hsl').on('click', () => {
    const { h, s, l } = getHsl();
    copyToClipboard(`hsl(${h}, ${s}%, ${l}%)`, '#color-copy-hsl');
  });
}
