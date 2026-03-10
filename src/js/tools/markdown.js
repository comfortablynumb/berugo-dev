let markedLoaded = false;
let markedLoadPromise = null;

function loadMarked() {
  if (markedLoaded) return Promise.resolve();

  if (markedLoadPromise) return markedLoadPromise;

  markedLoadPromise = import('https://cdn.jsdelivr.net/npm/marked@14/+esm').then(mod => {
    window._marked = mod.marked;
    markedLoaded = true;
  });

  return markedLoadPromise;
}

function renderPreview(input) {
  if (!markedLoaded || !window._marked) {
    return '<p class="text-gray-400 italic text-sm">Loading renderer…</p>';
  }

  return window._marked.parse(input || '');
}

function switchTab(tab) {
  if (tab === 'preview') {
    $('#md-tab-raw').removeClass('active-tab').addClass('inactive-tab');
    $('#md-tab-preview').removeClass('inactive-tab').addClass('active-tab');
    $('#md-raw-pane').addClass('hidden');
    $('#md-preview-pane').removeClass('hidden');
    $('#md-preview-content').html(renderPreview($('#md-input').val()));
  } else {
    $('#md-tab-preview').removeClass('active-tab').addClass('inactive-tab');
    $('#md-tab-raw').removeClass('inactive-tab').addClass('active-tab');
    $('#md-preview-pane').addClass('hidden');
    $('#md-raw-pane').removeClass('hidden');
  }
}

export function initMarkdown() {
  loadMarked();

  $('#md-tab-raw').on('click', () => switchTab('raw'));
  $('#md-tab-preview').on('click', () => switchTab('preview'));

  $('#md-input').on('input', () => {
    if (!$('#md-preview-pane').hasClass('hidden')) {
      $('#md-preview-content').html(renderPreview($('#md-input').val()));
    }
  });

  $('#md-clear').on('click', () => {
    $('#md-input').val('');
    $('#md-preview-content').html('');
  });
}
