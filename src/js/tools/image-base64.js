import { copyToClipboard } from '../utils.js';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderResult(name, size, type, dataUrl) {
  const base64 = dataUrl.split(',')[1];

  $('#imgb64-preview').attr('src', dataUrl);
  $('#imgb64-name').text(name);
  $('#imgb64-size').text(formatBytes(size));
  $('#imgb64-type').text(type);
  $('#imgb64-dataurl').val(dataUrl);
  $('#imgb64-base64').val(base64);
  $('#imgb64-img-tag').val(`<img src="${dataUrl}" alt="${name}" />`);
  $('#imgb64-css-bg').val(`background-image: url("${dataUrl}");`);
  $('#imgb64-result').removeClass('hidden');
}

function processFile(file) {
  $('#imgb64-error').addClass('hidden');
  $('#imgb64-result').addClass('hidden');

  if (!file || !file.type.startsWith('image/')) {
    $('#imgb64-error').removeClass('hidden').text('Please select an image file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = e => renderResult(file.name, file.size, file.type, e.target.result);
  reader.readAsDataURL(file);
}

function initDropZone() {
  $('#imgb64-drop').on('dragover', e => {
    e.preventDefault();
    $('#imgb64-drop').addClass('border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10');
  }).on('dragleave drop', e => {
    e.preventDefault();
    $('#imgb64-drop').removeClass('border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10');

    if (e.type === 'drop') processFile(e.originalEvent.dataTransfer.files[0]);
  });
}

function initCopyButtons() {
  $('#imgb64-copy-dataurl').on('click', () => copyToClipboard($('#imgb64-dataurl').val(), '#imgb64-copy-dataurl'));
  $('#imgb64-copy-base64').on('click', () => copyToClipboard($('#imgb64-base64').val(), '#imgb64-copy-base64'));
  $('#imgb64-copy-img').on('click', () => copyToClipboard($('#imgb64-img-tag').val(), '#imgb64-copy-img'));
  $('#imgb64-copy-css').on('click', () => copyToClipboard($('#imgb64-css-bg').val(), '#imgb64-copy-css'));
}

export function initImageBase64() {
  $('#imgb64-file').on('change', function () { processFile(this.files[0]); });
  initDropZone();
  initCopyButtons();
}
