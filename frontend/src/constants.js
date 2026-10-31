export const FAULTS = [
  { name: 'Normal', color: '#38e0a1' },
  { name: 'Short Circuit', color: '#ff5d6c' },
  { name: 'Degradation', color: '#ff9f5a' },
  { name: 'Open Circuit', color: '#a98bff' },
  { name: 'Shadowing', color: '#4db8ff' },
]

export const FIELDS = [
  { key: 'vdc1', label: 'String 1 voltage', hint: 'vdc1' },
  { key: 'vdc2', label: 'String 2 voltage', hint: 'vdc2' },
  { key: 'idc1', label: 'String 1 current', hint: 'idc1' },
  { key: 'idc2', label: 'String 2 current', hint: 'idc2' },
  { key: 'irr', label: 'Irradiance', hint: 'irr' },
  { key: 'pvt', label: 'Panel temperature', hint: 'pvt' },
]

export const EMPTY_READING = Object.fromEntries(FIELDS.map((f) => [f.key, '']))

export const SAMPLES = [
  { name: 'Normal', values: { vdc1: '35.2749', vdc2: '42.9735', idc1: '0.1155', idc2: '0.0436', irr: '1.7059', pvt: '15.2109' } },
  { name: 'Short Circuit', values: { vdc1: '261.8260', vdc2: '203.3270', idc1: '8.6655', idc2: '8.3304', irr: '899.5280', pvt: '45.3741' } },
  { name: 'Degradation', values: { vdc1: '267.0240', vdc2: '242.9340', idc1: '8.3330', idc2: '8.0211', irr: '883.7940', pvt: '43.4716' } },
  { name: 'Open Circuit', values: { vdc1: '1.6165', vdc2: '271.3570', idc1: '0.1188', idc2: '8.6509', irr: '959.0260', pvt: '52.2597' } },
  { name: 'Shadowing', values: { vdc1: '288.5160', vdc2: '265.3540', idc1: '5.1026', idc2: '4.9172', irr: '551.9880', pvt: '31.1852' } },
]