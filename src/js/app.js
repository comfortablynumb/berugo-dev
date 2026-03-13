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
import { initSortLines } from './tools/sort-lines.js';
import { initNanoid } from './tools/nanoid.js';
import { initCidr } from './tools/cidr.js';
import { initXmlFormatter } from './tools/xml-formatter.js';
import { initHtmlBeautifier } from './tools/html-beautifier.js';
import { initUnitConverter } from './tools/unit-converter.js';
import { initTotp } from './tools/totp.js';
import { initYamlJson } from './tools/yaml-json.js';
import { initQrCode } from './tools/qrcode.js';
import { initJsonSchema } from './tools/json-schema.js';
import { initJsonDiff } from './tools/json-diff.js';
import { initDateCalc } from './tools/date-calc.js';
import { initChmod } from './tools/chmod.js';
import { initImageBase64 } from './tools/image-base64.js';
import { initHexDump } from './tools/hex-dump.js';
import { initHmac } from './tools/hmac.js';
import { initSqlFormatter } from './tools/sql-formatter.js';
import { initCssFormatter } from './tools/css-formatter.js';
import { initJsFormatter } from './tools/js-formatter.js';
import { initPemDecoder } from './tools/pem-decoder.js';
import { initBcrypt } from './tools/bcrypt.js';
import { initJsonPath } from './tools/jsonpath.js';

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
  initSortLines();
  initNanoid();
  initCidr();
  initXmlFormatter();
  initHtmlBeautifier();
  initUnitConverter();
  initTotp();
  initYamlJson();
  initQrCode();
  initJsonSchema();
  initJsonDiff();
  initDateCalc();
  initChmod();
  initImageBase64();
  initHexDump();
  initHmac();
  initSqlFormatter();
  initCssFormatter();
  initJsFormatter();
  initPemDecoder();
  initBcrypt();
  initJsonPath();

  const saved = localStorage.getItem('activeTool') || 'home';
  activateTool(saved);
});
