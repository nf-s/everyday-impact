import test from 'node:test';
import assert from 'node:assert/strict';
import { energyTravelGroups } from '../dist/data/energy-travel.js';

function record(groupId, itemId) {
  const group = energyTravelGroups.find(group => group.id === groupId);
  assert.ok(group, groupId);
  const item = group.options.find(item => item.id === itemId);
  assert.ok(item, groupId + '/' + itemId);
  return { group, item };
}

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, actual + ' differs from ' + expected);
}

test('Australian electricity includes the published upstream column, not the market residual mix', () => {
  const expected = {
    'nsw-act': [0.60, 0.07],
    victoria: [0.74, 0.11],
    queensland: [0.65, 0.11],
    'south-australia': [0.21, 0.03],
    'wa-swis': [0.45, 0.10],
    'wa-nwis': [0.56, 0.09],
    tasmania: [0.21, 0.03],
    'nt-dkis': [0.55, 0.13],
    national: [0.59, 0.10]
  };
  for (const [id, [generation, upstream]] of Object.entries(expected)) {
    const { item } = record('au-grid-electricity', id);
    near(item.values.carbon, generation + upstream);
    assert.equal(item.values.energy, 1);
  }
  // An illustrative 10 kWh/day Tasmanian bill: 3,650 delivered kWh, 876 kg CO₂e.
  near(record('au-grid-electricity', 'tasmania').item.values.carbon * 10 * 365, 876);
});

test('gas converts GJ factors to bill MJ and labels confidential upstream proxies', () => {
  const metro = record('au-pipeline-gas', 'nsw-act-metro');
  const nonMetro = record('au-pipeline-gas', 'nsw-act-nonmetro');
  assert.equal(metro.group.singular, 'MJ');
  near(metro.item.values.carbon, (51.53 + 13.1) / 1000);
  near(nonMetro.item.values.carbon, (51.53 + 14.0) / 1000);
  const tas = record('au-pipeline-gas', 'tas-victorian-proxy').item;
  const nt = record('au-pipeline-gas', 'nt-wa-proxy').item;
  near(tas.values.carbon, record('au-pipeline-gas', 'victoria').item.values.carbon);
  near(nt.values.carbon, record('au-pipeline-gas', 'wa-nonmetro').item.values.carbon);
  assert.match(tas.label, /proxy/);
  assert.match(tas.note, /confidential/);
  assert.match(nt.label, /non-metro proxy/);
  assert.match(nt.note, /not a measured NT/);
});

test('road and stationary LPG retain their different published fuel-energy and combustion factors', () => {
  const stationary = record('au-stationary-liquid-fuels', 'lpg');
  const road = record('au-road-fuels', 'lpg');
  assert.equal(stationary.group.singular, 'litre');
  assert.equal(road.group.singular, 'litre');
  near(stationary.item.values.carbon, 25.7 * (60.60 + 20.2) / 1000);
  near(road.item.values.carbon, 26.2 * (61.00 + 20.2) / 1000);
  assert.notEqual(stationary.item.values.carbon, road.item.values.carbon);
  // Fuel energy is chemical energy; it must not appear as the Electricity metric.
  assert.equal(stationary.item.values.energy, undefined);
  assert.equal(road.item.values.energy, undefined);
});

test('motorcycles use vehicle-km while taxi and mixed-ferry factors use passenger-km', () => {
  const motorcycle = record('uk-motorcycles', 'small');
  const taxi = record('uk-taxi-travel', 'regular');
  const ferry = record('uk-ferry-travel', 'car-passenger');
  assert.match(motorcycle.group.unit, /vehicle-km/);
  assert.match(taxi.group.unit, /passenger-km/);
  assert.match(ferry.group.unit, /passenger-km/);
  near(motorcycle.item.values.carbon, 0.08319);
  // D71 and D19 are already passenger-km: do not divide by occupancy again.
  near(taxi.item.values.carbon, 0.14861);
  near(ferry.item.values.carbon, 0.12933);
  assert.match(ferry.group.sourceNote, /Excludes passenger-only ferries/);
});
