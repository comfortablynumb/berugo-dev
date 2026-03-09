import { copyToClipboard } from '../utils.js';

function parseCsvRow(line) {
  const fields = [];
  let i = 0;

  while (i <= line.length) {
    if (i === line.length) { fields.push(''); break; }

    if (line[i] === '"') {
      let field = '';
      i++;

      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else { field += line[i++]; }
      }

      fields.push(field);
      i++;
    } else {
      const end = line.indexOf(',', i);

      if (end === -1) { fields.push(line.slice(i)); break; }

      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }

  return fields;
}

function csvToJson(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());

  if (lines.length < 2) throw new Error('CSV needs at least a header row and one data row.');

  const headers = parseCsvRow(lines[0]).map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = parseCsvRow(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function escapeCsvField(val) {
  const s = String(val ?? '');
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function jsonToCsv(text) {
  const data = JSON.parse(text);

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('JSON must be a non-empty array of objects.');
  }

  const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];
  const rows = data.map(obj => headers.map(h => escapeCsvField(obj[h])).join(','));

  return [headers.map(escapeCsvField).join(','), ...rows].join('\n');
}

function convert(fn) {
  try {
    $('#csv-json-output').val(fn($('#csv-json-input').val()));
    $('#csv-json-error').addClass('hidden');
  } catch (e) {
    $('#csv-json-error').removeClass('hidden').text(e.message);
  }
}

export function initCsvJson() {
  $('#csv-to-json-btn').on('click', () => convert(t => JSON.stringify(csvToJson(t), null, 2)));
  $('#json-to-csv-btn').on('click', () => convert(jsonToCsv));

  $('#csv-json-clear-btn').on('click', () => {
    $('#csv-json-input, #csv-json-output').val('');
    $('#csv-json-error').addClass('hidden');
  });

  $('#csv-json-copy-btn').on('click', () => copyToClipboard($('#csv-json-output').val(), '#csv-json-copy-btn'));
}
