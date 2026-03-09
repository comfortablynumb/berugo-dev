import { initBase64 } from './tools/base64.js';
import { initUrlCodec } from './tools/url-codec.js';
import { initHtmlEntities } from './tools/html-entities.js';
import { initJwt } from './tools/jwt.js';
import { initJwks } from './tools/jwks.js';
import { initHash } from './tools/hash.js';
import { initJsonFormatter } from './tools/json-formatter.js';
import { initCsvJson } from './tools/csv-json.js';
import { initNumberBase } from './tools/number-base.js';
import { initColorConverter } from './tools/color-converter.js';
import { initStringCase } from './tools/string-case.js';
import { initUrlParser } from './tools/url-parser.js';
import { initUuid } from './tools/uuid.js';
import { initTimestamp } from './tools/timestamp.js';
import { initLorem } from './tools/lorem.js';
import { initPassword } from './tools/password.js';
import { initRegex } from './tools/regex.js';
import { initDiff } from './tools/diff.js';

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  $('#theme-icon').text(isDark ? '☀️' : '🌙');
}

function activateTool(toolId) {
  $('.nav-item').removeClass('active');
  $(`.nav-item[data-tool="${toolId}"]`).addClass('active');

  $('.tool-panel').removeClass('active');
  $(`#panel-${toolId}`).addClass('active');

  localStorage.setItem('activeTool', toolId);
}

function initNav() {
  $('.nav-item[data-tool]').on('click', function () {
    activateTool($(this).data('tool'));
  });
}

function initHomeCards() {
  $('.home-card[data-tool]').on('click', function () {
    activateTool($(this).data('tool'));
  });
}

function initSidebarToggle() {
  $('#sidebar-toggle').on('click', () => {
    $('#sidebar').toggleClass('-translate-x-full');
    $('#sidebar-overlay').toggleClass('hidden');
  });

  $('#sidebar-overlay').on('click', () => {
    $('#sidebar').addClass('-translate-x-full');
    $('#sidebar-overlay').addClass('hidden');
  });
}

$(document).ready(() => {
  initTheme();
  updateThemeIcon(document.documentElement.classList.contains('dark'));

  $('#theme-toggle').on('click', toggleTheme);

  initNav();
  initHomeCards();
  initSidebarToggle();

  initBase64();
  initUrlCodec();
  initHtmlEntities();
  initJwt();
  initJwks();
  initHash();
  initJsonFormatter();
  initCsvJson();
  initNumberBase();
  initColorConverter();
  initStringCase();
  initUrlParser();
  initUuid();
  initTimestamp();
  initLorem();
  initPassword();
  initRegex();
  initDiff();

  const saved = localStorage.getItem('activeTool') || 'home';
  activateTool(saved);
});
