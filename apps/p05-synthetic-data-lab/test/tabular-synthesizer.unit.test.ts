/**
 * L3 Unit tests – TabularSynthesizer (TDD: written before implementation)
 *
 * These tests intentionally fail until TabularSynthesizer is implemented.
 * Run via:  npm test
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { TabularSynthesizer } from '../src/synthesis/tabular-synthesizer';

test('TabularSynthesizer generates exactly targetRows rows', () => {
  const synth = new TabularSynthesizer();
  const rows = synth.generate({
    columns: ['id', 'age', 'salary'],
    targetRows: 50,
  });
  assert.equal(rows.length, 50);
});

test('TabularSynthesizer generates all specified columns on every row', () => {
  const synth = new TabularSynthesizer();
  const rows = synth.generate({
    columns: ['name', 'score', 'region'],
    targetRows: 10,
  });
  for (const row of rows) {
    assert.ok('name' in row, 'missing column: name');
    assert.ok('score' in row, 'missing column: score');
    assert.ok('region' in row, 'missing column: region');
  }
});

test('TabularSynthesizer respects categorical cardinality for string columns', () => {
  const synth = new TabularSynthesizer();
  const cardinalityValues = ['A', 'B', 'C'];
  const rows = synth.generate({
    columns: ['category'],
    targetRows: 30,
    columnConfig: {
      category: { type: 'categorical', values: cardinalityValues },
    },
  });
  const seen = new Set(rows.map((r) => r['category']));
  // Every generated value must be one of the declared cardinality values
  for (const v of seen) {
    assert.ok(cardinalityValues.includes(String(v)), `Unexpected value: ${v}`);
  }
});

test('TabularSynthesizer respects numeric range for numeric columns', () => {
  const synth = new TabularSynthesizer();
  const rows = synth.generate({
    columns: ['age'],
    targetRows: 100,
    columnConfig: {
      age: { type: 'numeric', min: 18, max: 65 },
    },
  });
  for (const row of rows) {
    const v = Number(row['age']);
    assert.ok(v >= 18 && v <= 65, `age ${v} out of [18, 65]`);
  }
});

test('TabularSynthesizer with no config falls back to auto-typed defaults', () => {
  const synth = new TabularSynthesizer();
  // No column config – should still produce rows without throwing
  const rows = synth.generate({ columns: ['x', 'y', 'z'], targetRows: 5 });
  assert.equal(rows.length, 5);
});

test('TabularSynthesizer distributes categorical values across generated rows', () => {
  const synth = new TabularSynthesizer();
  const rows = synth.generate({
    columns: ['status'],
    targetRows: 6,
    columnConfig: {
      status: { type: 'categorical', values: ['active', 'inactive', 'pending'] },
    },
  });
  // With 6 rows and 3 values, each should appear at least once (round-robin)
  const counts = new Map<string, number>();
  for (const row of rows) {
    const v = String(row['status']);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  assert.equal(counts.size, 3, 'Expected all 3 categories represented');
});
