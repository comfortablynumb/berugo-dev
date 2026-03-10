function ipToInt(ip) {
  const parts = ip.split('.').map(Number);

  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IP address: ' + ip);
  }

  return (parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3]) >>> 0;
}

function intToIp(n) {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join('.');
}

function calculateCidr(cidr) {
  const [ipPart, prefixStr] = cidr.trim().split('/');
  const prefix = parseInt(prefixStr, 10);

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error('Prefix length must be 0–32');
  }

  const ip = ipToInt(ipPart);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
  const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;

  return {
    ip: intToIp(ip),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    mask: intToIp(mask),
    wildcard: intToIp(~mask >>> 0),
    prefix,
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    totalHosts,
    usableHosts,
  };
}

function renderRow(label, value) {
  return `
    <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span class="text-gray-500 dark:text-gray-400 text-sm">${label}</span>
      <span class="font-mono text-sm font-medium">${value}</span>
    </div>`;
}

function renderResult(r) {
  return [
    renderRow('IP Address', r.ip),
    renderRow('Network', r.network + '/' + r.prefix),
    renderRow('Broadcast', r.broadcast),
    renderRow('Subnet Mask', r.mask),
    renderRow('Wildcard Mask', r.wildcard),
    renderRow('First Host', r.firstHost),
    renderRow('Last Host', r.lastHost),
    renderRow('Total Hosts', r.totalHosts.toLocaleString()),
    renderRow('Usable Hosts', r.usableHosts.toLocaleString()),
  ].join('');
}

export function initCidr() {
  const $input = $('#cidr-input');
  const $error = $('#cidr-error');
  const $result = $('#cidr-result');
  const $output = $('#cidr-output');

  function run() {
    const val = $input.val().trim();

    if (!val) {
      $result.addClass('hidden');
      $error.addClass('hidden');
      return;
    }

    try {
      const data = calculateCidr(val);
      $output.html(renderResult(data));
      $result.removeClass('hidden');
      $error.addClass('hidden');
    } catch (e) {
      $error.text(e.message).removeClass('hidden');
      $result.addClass('hidden');
    }
  }

  $('#cidr-btn').on('click', run);
  $input.on('keydown', e => { if (e.key === 'Enter') run(); });
}
