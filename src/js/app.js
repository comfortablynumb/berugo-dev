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
import { initMarkdown } from './tools/markdown.js';
import { initJsonTs } from './tools/json-ts.js';
import { initCron } from './tools/cron.js';
import { initTextStats } from './tools/text-stats.js';
import { initStringEscape } from './tools/string-escape.js';

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

function closeMobileMenu() {
  $('#mobile-menu').addClass('hidden');
}

function activateTool(toolId) {
  $('.nav-top-item, .nav-dropdown-item, .nav-item').removeClass('active');
  $('.nav-top-btn').removeClass('active');

  $(`.nav-top-item[data-tool="${toolId}"]`).addClass('active');
  $(`.nav-dropdown-item[data-tool="${toolId}"]`).addClass('active');
  $(`.nav-item[data-tool="${toolId}"]`).addClass('active');

  const $ddItem = $(`.nav-dropdown-item[data-tool="${toolId}"]`);

  if ($ddItem.length) {
    $ddItem.closest('.nav-dropdown').find('.nav-top-btn').addClass('active');
  }

  $('.tool-panel').removeClass('active');
  $(`#panel-${toolId}`).addClass('active');

  localStorage.setItem('activeTool', toolId);
}

function initNav() {
  $('.nav-top-item[data-tool], .nav-dropdown-item[data-tool], .nav-item[data-tool]').on('click', function () {
    activateTool($(this).data('tool'));
    closeMobileMenu();
  });
}

function initHomeCards() {
  $('.home-card[data-tool]').on('click', function () {
    activateTool($(this).data('tool'));
  });
}

function initMobileMenu() {
  $('#mobile-menu-btn').on('click', e => {
    $('#mobile-menu').toggleClass('hidden');
    e.stopPropagation();
  });

  $(document).on('click', e => {
    if (!$(e.target).closest('#mobile-menu, #mobile-menu-btn').length) closeMobileMenu();
  });
}

$(document).ready(() => {
  initTheme();
  updateThemeIcon(document.documentElement.classList.contains('dark'));

  $('#theme-toggle').on('click', toggleTheme);

  initNav();
  initHomeCards();
  initMobileMenu();

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
  initMarkdown();
  initJsonTs();
  initCron();
  initTextStats();
  initStringEscape();

  const saved = localStorage.getItem('activeTool') || 'home';
  activateTool(saved);
});
