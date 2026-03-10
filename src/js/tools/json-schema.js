import { copyToClipboard } from '../utils.js';

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function validateType(data, type, path) {
  const types = Array.isArray(type) ? type : [type];
  const actual = getType(data);
  const matches = types.some(t =>
    t === 'integer' ? (typeof data === 'number' && Number.isInteger(data)) : actual === t
  );
  return matches ? [] : [`${path}: expected ${types.join('|')}, got ${actual}`];
}

function validateString(data, schema, path) {
  if (typeof data !== 'string') return [];
  const errors = [];

  if (schema.minLength !== undefined && data.length < schema.minLength)
    errors.push(`${path}: length ${data.length} < minLength ${schema.minLength}`);
  if (schema.maxLength !== undefined && data.length > schema.maxLength)
    errors.push(`${path}: length ${data.length} > maxLength ${schema.maxLength}`);
  if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(data))
    errors.push(`${path}: does not match pattern "${schema.pattern}"`);

  return errors;
}

function validateNumber(data, schema, path) {
  if (typeof data !== 'number') return [];
  const errors = [];

  if (schema.minimum !== undefined && data < schema.minimum)
    errors.push(`${path}: ${data} < minimum ${schema.minimum}`);
  if (schema.maximum !== undefined && data > schema.maximum)
    errors.push(`${path}: ${data} > maximum ${schema.maximum}`);
  if (schema.exclusiveMinimum !== undefined && data <= schema.exclusiveMinimum)
    errors.push(`${path}: ${data} <= exclusiveMinimum ${schema.exclusiveMinimum}`);
  if (schema.exclusiveMaximum !== undefined && data >= schema.exclusiveMaximum)
    errors.push(`${path}: ${data} >= exclusiveMaximum ${schema.exclusiveMaximum}`);
  if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0)
    errors.push(`${path}: ${data} is not a multiple of ${schema.multipleOf}`);

  return errors;
}

function validateObject(data, schema, path) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return [];
  const errors = [];
  const known = new Set(Object.keys(schema.properties || {}));

  for (const key of (schema.required || [])) {
    if (!(key in data)) errors.push(`${path}: missing required property "${key}"`);
  }

  for (const [key, sub] of Object.entries(schema.properties || {})) {
    if (key in data) errors.push(...validate(data[key], sub, `${path}/${key}`));
  }

  if (schema.additionalProperties === false) {
    for (const key of Object.keys(data)) {
      if (!known.has(key)) errors.push(`${path}: additional property "${key}" not allowed`);
    }
  } else if (typeof schema.additionalProperties === 'object' && schema.additionalProperties !== null) {
    for (const [key, val] of Object.entries(data)) {
      if (!known.has(key)) errors.push(...validate(val, schema.additionalProperties, `${path}/${key}`));
    }
  }

  return errors;
}

function validateArray(data, schema, path) {
  if (!Array.isArray(data)) return [];
  const errors = [];

  if (schema.minItems !== undefined && data.length < schema.minItems)
    errors.push(`${path}: length ${data.length} < minItems ${schema.minItems}`);
  if (schema.maxItems !== undefined && data.length > schema.maxItems)
    errors.push(`${path}: length ${data.length} > maxItems ${schema.maxItems}`);

  if (schema.uniqueItems) {
    const seen = new Set();
    for (const item of data) {
      const k = JSON.stringify(item);
      if (seen.has(k)) { errors.push(`${path}: items must be unique`); break; }
      seen.add(k);
    }
  }

  if (schema.items && typeof schema.items === 'object' && !Array.isArray(schema.items)) {
    data.forEach((item, i) => errors.push(...validate(item, schema.items, `${path}/${i}`)));
  }

  return errors;
}

function validateCombinators(data, schema, path) {
  const errors = [];

  if (schema.anyOf) {
    const ok = schema.anyOf.some(s => validate(data, s, path).length === 0);
    if (!ok) errors.push(`${path}: must match at least one schema in anyOf`);
  }
  if (schema.allOf) {
    for (const s of schema.allOf) errors.push(...validate(data, s, path));
  }
  if (schema.oneOf) {
    const n = schema.oneOf.filter(s => validate(data, s, path).length === 0).length;
    if (n !== 1) errors.push(`${path}: must match exactly one schema in oneOf (matched ${n})`);
  }
  if (schema.not && validate(data, schema.not, path).length === 0) {
    errors.push(`${path}: must not match schema in "not"`);
  }
  if (schema.if) {
    const branch = validate(data, schema.if, path).length === 0 ? schema.then : schema.else;
    if (branch) errors.push(...validate(data, branch, path));
  }

  return errors;
}

function validate(data, schema, path = '#') {
  if (typeof schema === 'boolean') return schema ? [] : [`${path}: false schema`];
  const errors = [];

  if (schema.type !== undefined) errors.push(...validateType(data, schema.type, path));
  if (schema.enum !== undefined && !schema.enum.some(v => JSON.stringify(v) === JSON.stringify(data)))
    errors.push(`${path}: must be one of ${JSON.stringify(schema.enum)}`);
  if (schema.const !== undefined && JSON.stringify(data) !== JSON.stringify(schema.const))
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);

  errors.push(...validateString(data, schema, path));
  errors.push(...validateNumber(data, schema, path));
  errors.push(...validateObject(data, schema, path));
  errors.push(...validateArray(data, schema, path));
  errors.push(...validateCombinators(data, schema, path));

  return errors;
}

export function initJsonSchema() {
  const $data = $('#jschema-data');
  const $schema = $('#jschema-schema');
  const $error = $('#jschema-error');
  const $result = $('#jschema-result');
  const $status = $('#jschema-status');
  const $errors = $('#jschema-errors');

  $('#jschema-validate').on('click', () => {
    $error.addClass('hidden');
    $result.addClass('hidden');

    try {
      const data = JSON.parse($data.val());
      const schema = JSON.parse($schema.val());
      const errs = validate(data, schema);

      if (errs.length === 0) {
        $status.html('<span class="text-green-600 dark:text-green-400 font-semibold">✓ Valid — data matches schema</span>');
        $errors.addClass('hidden');
      } else {
        $status.html(`<span class="text-red-600 dark:text-red-400 font-semibold">✗ Invalid — ${errs.length} error(s)</span>`);
        $errors.html(errs.map(e => `<li class="font-mono text-xs py-0.5">${e}</li>`).join('')).removeClass('hidden');
      }

      $result.removeClass('hidden');
    } catch (e) {
      $error.text('Parse error: ' + e.message).removeClass('hidden');
    }
  });

  $('#jschema-clear').on('click', () => {
    $data.val('');
    $schema.val('');
    $error.addClass('hidden');
    $result.addClass('hidden');
  });
}
