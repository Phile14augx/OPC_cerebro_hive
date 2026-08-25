import assert from 'node:assert/strict';
import test from 'node:test';
import { WidgetRegistry } from './widget';

test('WidgetRegistry does not expose a structurally invalid plugin registration', () => {
  const invalidPlugin = {
    metadata: { type: 'invalid-task-3k-plugin' },
  };

  Reflect.apply(WidgetRegistry.register, WidgetRegistry, [invalidPlugin]);

  assert.equal(WidgetRegistry.get('invalid-task-3k-plugin'), undefined);
});
