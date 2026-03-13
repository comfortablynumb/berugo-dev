import { copyToClipboard } from '../utils.js';

const OID_MAP = {
  '2.5.4.3': 'CN',
  '2.5.4.5': 'serialNumber',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.12': 'title',
  '2.5.4.42': 'givenName',
  '2.5.4.4': 'surname',
  '1.2.840.113549.1.9.1': 'emailAddress',
};

const ALGO_OID_MAP = {
  '1.2.840.113549.1.1.1': 'RSA',
  '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
  '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
  '1.2.840.113549.1.1.10': 'RSASSA-PSS',
  '1.2.840.10045.2.1': 'EC',
  '1.2.840.10045.3.1.7': 'P-256 (prime256v1)',
  '1.3.132.0.34': 'P-384 (secp384r1)',
  '1.3.132.0.35': 'P-521 (secp521r1)',
  '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
  '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '2.16.840.1.101.3.4.2.1': 'SHA-256',
  '2.16.840.1.101.3.4.2.2': 'SHA-384',
  '2.16.840.1.101.3.4.2.3': 'SHA-512',
  '1.3.101.112': 'Ed25519',
  '1.3.101.113': 'Ed448',
};

const EXT_OID_MAP = {
  '2.5.29.14': 'Subject Key Identifier',
  '2.5.29.15': 'Key Usage',
  '2.5.29.17': 'Subject Alt Name',
  '2.5.29.19': 'Basic Constraints',
  '2.5.29.31': 'CRL Distribution Points',
  '2.5.29.32': 'Certificate Policies',
  '2.5.29.35': 'Authority Key Identifier',
  '2.5.29.37': 'Extended Key Usage',
  '1.3.6.1.5.5.7.1.1': 'Authority Info Access',
};

function pemToBytes(pem) {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);

  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  return bytes;
}

function parseLength(bytes, offset) {
  let len = bytes[offset];
  let bytesUsed = 1;

  if (len & 0x80) {
    const numBytes = len & 0x7f;
    len = 0;

    for (let i = 0; i < numBytes; i++) {
      len = (len << 8) | bytes[offset + 1 + i];
    }

    bytesUsed = 1 + numBytes;
  }

  return { len, bytesUsed };
}

function parseTlv(bytes, offset) {
  const tag = bytes[offset];
  const { len, bytesUsed } = parseLength(bytes, offset + 1);
  const headerLen = 1 + bytesUsed;
  const value = bytes.slice(offset + headerLen, offset + headerLen + len);
  const totalLen = headerLen + len;

  return { tag, len, value, totalLen, headerLen };
}

function parseOid(bytes) {
  const parts = [];
  parts.push(Math.floor(bytes[0] / 40));
  parts.push(bytes[0] % 40);

  let val = 0;

  for (let i = 1; i < bytes.length; i++) {
    val = (val << 7) | (bytes[i] & 0x7f);

    if (!(bytes[i] & 0x80)) {
      parts.push(val);
      val = 0;
    }
  }

  return parts.join('.');
}

function parseSequenceChildren(bytes) {
  const children = [];
  let offset = 0;

  while (offset < bytes.length) {
    const tlv = parseTlv(bytes, offset);
    children.push(tlv);
    offset += tlv.totalLen;
  }

  return children;
}

function decodeString(tlv) {
  return new TextDecoder().decode(tlv.value);
}

function parseName(bytes) {
  const sets = parseSequenceChildren(bytes);
  const parts = [];

  for (const set of sets) {
    const seqChildren = parseSequenceChildren(set.value);

    for (const seq of seqChildren) {
      const attrs = parseSequenceChildren(seq.value);

      if (attrs.length >= 2 && attrs[0].tag === 0x06) {
        const oid = parseOid(attrs[0].value);
        const name = OID_MAP[oid] || oid;
        const val = decodeString(attrs[1]);
        parts.push(`${name}=${val}`);
      }
    }
  }

  return parts.join(', ');
}

function parseTime(tlv) {
  const str = decodeString(tlv);

  if (tlv.tag === 0x17) {
    const y = parseInt(str.slice(0, 2), 10);
    const year = y >= 50 ? 1900 + y : 2000 + y;
    return `${year}-${str.slice(2, 4)}-${str.slice(4, 6)} ${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)} UTC`;
  }

  if (tlv.tag === 0x18) {
    return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)} UTC`;
  }

  return str;
}

function toHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(':');
}

function resolveAlgoOid(oid) {
  return ALGO_OID_MAP[oid] || oid;
}

function parseAlgoIdentifier(bytes) {
  const children = parseSequenceChildren(bytes);

  if (children.length >= 1 && children[0].tag === 0x06) {
    const oid = parseOid(children[0].value);
    let algo = resolveAlgoOid(oid);

    if (children.length >= 2 && children[1].tag === 0x06) {
      algo += ' (' + resolveAlgoOid(parseOid(children[1].value)) + ')';
    }

    return algo;
  }

  return 'Unknown';
}

function parseExtensions(bytes) {
  const exts = parseSequenceChildren(bytes);
  const results = [];

  for (const ext of exts) {
    const fields = parseSequenceChildren(ext.value);

    if (fields.length >= 2 && fields[0].tag === 0x06) {
      const oid = parseOid(fields[0].value);
      const name = EXT_OID_MAP[oid] || oid;
      results.push(name);
    }
  }

  return results;
}

function parseCertificate(pem) {
  const bytes = pemToBytes(pem);
  const cert = parseTlv(bytes, 0);
  const tbsCert = parseSequenceChildren(cert.value);
  const info = {};

  let idx = 0;

  if (tbsCert[0].tag === 0xa0) {
    const versionTlv = parseTlv(tbsCert[0].value, 0);
    info.version = 'v' + (versionTlv.value[0] + 1);
    idx = 1;
  } else {
    info.version = 'v1';
  }

  info.serialNumber = toHex(tbsCert[idx].value);
  idx++;

  info.signatureAlgorithm = parseAlgoIdentifier(tbsCert[idx].value);
  idx++;

  info.issuer = parseName(tbsCert[idx].value);
  idx++;

  const validity = parseSequenceChildren(tbsCert[idx].value);
  info.validFrom = parseTime(validity[0]);
  info.validTo = parseTime(validity[1]);
  idx++;

  info.subject = parseName(tbsCert[idx].value);
  idx++;

  const pubKeyInfo = parseSequenceChildren(tbsCert[idx].value);
  info.publicKeyAlgorithm = parseAlgoIdentifier(pubKeyInfo[0].value);

  if (pubKeyInfo[1].tag === 0x03 && pubKeyInfo[1].value.length > 1) {
    const keyBytes = pubKeyInfo[1].value.slice(1);
    info.publicKeyBits = keyBytes.length * 8;
  }

  idx++;

  while (idx < tbsCert.length) {
    if (tbsCert[idx].tag === 0xa3) {
      const extSeq = parseTlv(tbsCert[idx].value, 0);
      info.extensions = parseExtensions(extSeq.value);
    }

    idx++;
  }

  return info;
}

function formatCertInfo(info) {
  const lines = [];
  lines.push(`Version:              ${info.version}`);
  lines.push(`Serial Number:        ${info.serialNumber}`);
  lines.push(`Signature Algorithm:  ${info.signatureAlgorithm}`);
  lines.push(`Issuer:               ${info.issuer}`);
  lines.push(`Valid From:           ${info.validFrom}`);
  lines.push(`Valid To:             ${info.validTo}`);
  lines.push(`Subject:              ${info.subject}`);
  lines.push(`Public Key Algorithm: ${info.publicKeyAlgorithm}`);

  if (info.publicKeyBits) {
    lines.push(`Public Key Size:      ${info.publicKeyBits} bits`);
  }

  if (info.extensions && info.extensions.length > 0) {
    lines.push('');
    lines.push('Extensions:');
    info.extensions.forEach(ext => lines.push(`  - ${ext}`));
  }

  return lines.join('\n');
}

export function initPemDecoder() {
  const $input = $('#pem-input');
  const $output = $('#pem-output');
  const $error = $('#pem-error');

  $('#pem-decode').on('click', () => {
    $error.text('').addClass('hidden');
    const input = $input.val().trim();

    if (!input) return;

    if (!input.includes('-----BEGIN')) {
      $error.text('Not a valid PEM block — expected -----BEGIN CERTIFICATE-----').removeClass('hidden');
      $output.val('');
      return;
    }

    try {
      const info = parseCertificate(input);
      $output.val(formatCertInfo(info));
    } catch (e) {
      $error.text('Parse error: ' + e.message).removeClass('hidden');
      $output.val('');
    }
  });

  $('#pem-copy').on('click', () => copyToClipboard($output.val(), '#pem-copy'));
  $('#pem-clear').on('click', () => { $error.text('').addClass('hidden'); $input.val(''); $output.val(''); });
}
