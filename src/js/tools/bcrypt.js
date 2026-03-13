import { copyToClipboard } from '../utils.js';
import bcrypt from 'https://cdn.jsdelivr.net/npm/bcryptjs@2/+esm';

function showResult($el, text, isSuccess) {
  $el.text(text)
    .removeClass('hidden text-green-600 dark:text-green-400 text-red-600 dark:text-red-400');

  if (isSuccess) {
    $el.addClass('text-green-600 dark:text-green-400');
  } else {
    $el.addClass('text-red-600 dark:text-red-400');
  }
}

export function initBcrypt() {
  const $password = $('#bcrypt-password');
  const $rounds = $('#bcrypt-rounds');
  const $hashOutput = $('#bcrypt-hash-output');
  const $hashError = $('#bcrypt-hash-error');

  const $verifyPassword = $('#bcrypt-verify-password');
  const $verifyHash = $('#bcrypt-verify-hash');
  const $verifyResult = $('#bcrypt-verify-result');

  $('#bcrypt-generate').on('click', async () => {
    $hashError.addClass('hidden').text('');
    const password = $password.val();

    if (!password) {
      $hashError.text('Please enter a password.').removeClass('hidden');
      return;
    }

    const rounds = parseInt($rounds.val(), 10);
    const $btn = $('#bcrypt-generate');
    const original = $btn.text();
    $btn.text('Hashing…').prop('disabled', true);

    try {
      const hash = await bcrypt.hash(password, rounds);
      $hashOutput.val(hash);
    } catch (e) {
      $hashError.text('Error: ' + e.message).removeClass('hidden');
    } finally {
      $btn.text(original).prop('disabled', false);
    }
  });

  $('#bcrypt-verify').on('click', async () => {
    $verifyResult.addClass('hidden');
    const password = $verifyPassword.val();
    const hash = $verifyHash.val().trim();

    if (!password || !hash) {
      showResult($verifyResult, 'Please enter both a password and a hash.', false);
      $verifyResult.removeClass('hidden');
      return;
    }

    if (!/^\$2[aby]?\$\d{2}\$.{53}$/.test(hash)) {
      showResult($verifyResult, 'Invalid bcrypt hash format.', false);
      $verifyResult.removeClass('hidden');
      return;
    }

    const $btn = $('#bcrypt-verify');
    const original = $btn.text();
    $btn.text('Verifying…').prop('disabled', true);

    try {
      const match = await bcrypt.compare(password, hash);

      if (match) {
        showResult($verifyResult, 'Match — password is correct.', true);
      } else {
        showResult($verifyResult, 'No match — password does not match the hash.', false);
      }
    } catch (e) {
      showResult($verifyResult, 'Error: ' + e.message, false);
    } finally {
      $verifyResult.removeClass('hidden');
      $btn.text(original).prop('disabled', false);
    }
  });

  $('#bcrypt-hash-copy').on('click', () => copyToClipboard($hashOutput.val(), '#bcrypt-hash-copy'));
}
