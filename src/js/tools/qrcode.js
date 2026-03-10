let QRCode = null;

async function loadQr() {
  if (QRCode) return;
  const mod = await import('https://cdn.jsdelivr.net/npm/qrcode@1/+esm');
  QRCode = mod.default ?? mod;
}

async function render() {
  const text = $('#qr-input').val().trim();
  const level = $('#qr-level').val();
  const size = parseInt($('#qr-size').val(), 10) || 256;
  const $error = $('#qr-error');
  const $result = $('#qr-result');

  if (!text) {
    $result.addClass('hidden');
    $error.addClass('hidden');
    return;
  }

  if (!QRCode) {
    try {
      await loadQr();
    } catch (e) {
      $error.text('Failed to load QR library: ' + e.message).removeClass('hidden');
      return;
    }
  }

  $error.addClass('hidden');

  try {
    const canvas = document.getElementById('qr-canvas');
    await QRCode.toCanvas(canvas, text, {
      errorCorrectionLevel: level,
      width: size,
      margin: 2,
    });
    $result.removeClass('hidden');
  } catch (e) {
    $error.text('Error: ' + e.message).removeClass('hidden');
    $result.addClass('hidden');
  }
}

function download() {
  const canvas = document.getElementById('qr-canvas');
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function initQrCode() {
  $('#qr-generate').on('click', render);
  $('#qr-download').on('click', download);

  $('#qr-input').on('keydown', e => {
    if (e.key === 'Enter') render();
  });
}
