function parseToMs(input) {
  const num = Number(input);

  if (!isNaN(num) && input !== '') {
    return num > 1e12 ? num : num * 1000;
  }

  const d = new Date(input);

  if (!isNaN(d.getTime())) return d.getTime();

  return null;
}

function convertTimestamp() {
  const input = $('#ts-input').val().trim();
  $('#ts-error').addClass('hidden').text('');
  $('#ts-result').addClass('hidden');

  if (!input) return;

  const ms = parseToMs(input);

  if (ms === null) {
    $('#ts-error').removeClass('hidden').text('Invalid timestamp or date string.');
    return;
  }

  const d = new Date(ms);
  $('#ts-unix-s').text(Math.floor(ms / 1000));
  $('#ts-unix-ms').text(ms);
  $('#ts-utc').text(d.toUTCString());
  $('#ts-iso').text(d.toISOString());
  $('#ts-local').text(d.toLocaleString());
  $('#ts-result').removeClass('hidden');
}

export function initTimestamp() {
  $('#ts-convert-btn').on('click', convertTimestamp);
  $('#ts-now-btn').on('click', () => {
    $('#ts-input').val(Math.floor(Date.now() / 1000));
    convertTimestamp();
  });
  $('#ts-input').on('keydown', e => { if (e.key === 'Enter') convertTimestamp(); });
}
