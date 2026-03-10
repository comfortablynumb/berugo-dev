const CATEGORIES = {
  length: {
    label: 'Length', base: 'm',
    units: { mm:{label:'Millimeter',f:0.001},cm:{label:'Centimeter',f:0.01},m:{label:'Meter',f:1},km:{label:'Kilometer',f:1000},in:{label:'Inch',f:0.0254},ft:{label:'Foot',f:0.3048},yd:{label:'Yard',f:0.9144},mi:{label:'Mile',f:1609.344},nmi:{label:'Nautical Mile',f:1852} },
  },
  weight: {
    label: 'Weight', base: 'kg',
    units: { mg:{label:'Milligram',f:1e-6},g:{label:'Gram',f:0.001},kg:{label:'Kilogram',f:1},t:{label:'Metric Ton',f:1000},oz:{label:'Ounce',f:0.0283495},lb:{label:'Pound',f:0.453592},st:{label:'Stone',f:6.35029} },
  },
  temperature: {
    label: 'Temperature', special: true,
    units: { c:{label:'°Celsius'},f:{label:'°Fahrenheit'},k:{label:'Kelvin'} },
  },
  data: {
    label: 'Data Size', base: 'b',
    units: { b:{label:'Byte',f:1},kb:{label:'Kilobyte',f:1024},mb:{label:'Megabyte',f:1048576},gb:{label:'Gigabyte',f:1073741824},tb:{label:'Terabyte',f:1099511627776} },
  },
  time: {
    label: 'Time', base: 's',
    units: { ms:{label:'Millisecond',f:0.001},s:{label:'Second',f:1},min:{label:'Minute',f:60},h:{label:'Hour',f:3600},day:{label:'Day',f:86400},week:{label:'Week',f:604800} },
  },
  speed: {
    label: 'Speed', base: 'mps',
    units: { mps:{label:'m/s',f:1},kmh:{label:'km/h',f:1/3.6},mph:{label:'mph',f:0.44704},knot:{label:'Knot',f:0.514444} },
  },
  area: {
    label: 'Area', base: 'm2',
    units: { mm2:{label:'mm²',f:1e-6},cm2:{label:'cm²',f:0.0001},m2:{label:'m²',f:1},km2:{label:'km²',f:1e6},ft2:{label:'ft²',f:0.092903},acre:{label:'Acre',f:4046.86},ha:{label:'Hectare',f:10000} },
  },
  volume: {
    label: 'Volume', base: 'l',
    units: { ml:{label:'mL',f:0.001},l:{label:'L',f:1},m3:{label:'m³',f:1000},floz:{label:'fl oz (US)',f:0.0295735},cup:{label:'Cup (US)',f:0.236588},pt:{label:'Pint (US)',f:0.473176},gal:{label:'Gallon (US)',f:3.78541} },
  },
};

function toCelsius(v, from) {
  if (from === 'c') return v;
  if (from === 'f') return (v - 32) * 5 / 9;
  if (from === 'k') return v - 273.15;
}

function fromCelsius(c, to) {
  if (to === 'c') return c;
  if (to === 'f') return c * 9 / 5 + 32;
  if (to === 'k') return c + 273.15;
}

function convertTemp(value, from, to) {
  return fromCelsius(toCelsius(value, from), to);
}

function convertRegular(value, from, to, units) {
  const inBase = value * units[from].f;
  return inBase / units[to].f;
}

function formatNum(n) {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e-4 && Math.abs(n) < 1e12) return parseFloat(n.toPrecision(8)).toString();
  return n.toExponential(4);
}

function buildOptions(units) {
  return Object.entries(units)
    .map(([k, u]) => `<option value="${k}">${u.label}</option>`)
    .join('');
}

function renderRows(value, fromKey, cat) {
  const { units, special } = cat;
  return Object.entries(units).map(([key, u]) => {
    if (key === fromKey) return '';
    const result = special
      ? convertTemp(value, fromKey, key)
      : convertRegular(value, fromKey, key, units);
    return `<div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span class="text-sm text-gray-500 dark:text-gray-400">${u.label}</span>
      <span class="font-mono font-semibold text-sm">${formatNum(result)}</span>
    </div>`;
  }).join('');
}

function updateFromOptions() {
  const catKey = $('#unit-category').val();
  const cat = CATEGORIES[catKey];
  $('#unit-from').html(buildOptions(cat.units));
  update();
}

function update() {
  const catKey = $('#unit-category').val();
  const cat = CATEGORIES[catKey];
  const value = parseFloat($('#unit-value').val());
  const fromKey = $('#unit-from').val();

  if (isNaN(value)) {
    $('#unit-output').html('<p class="text-gray-400 text-sm italic py-2">Enter a value above.</p>');
    return;
  }

  $('#unit-output').html(renderRows(value, fromKey, cat));
}

export function initUnitConverter() {
  const catOptions = Object.entries(CATEGORIES)
    .map(([k, c]) => `<option value="${k}">${c.label}</option>`)
    .join('');

  $('#unit-category').html(catOptions);

  updateFromOptions();

  $('#unit-category').on('change', updateFromOptions);
  $('#unit-value, #unit-from').on('input change', update);
}
