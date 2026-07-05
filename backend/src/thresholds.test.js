import test from 'node:test'
import assert from 'node:assert/strict'
import { statusFor } from './thresholds.js'

test('healthy when all metrics are low', () => {
  assert.equal(statusFor({ cpu: 20, memory: 30, disk: 40 }), 'healthy')
})

test('warning when one metric crosses the warning threshold', () => {
  assert.equal(statusFor({ cpu: 80, memory: 30, disk: 40 }), 'warning')
})

test('critical when one metric crosses the critical threshold', () => {
  assert.equal(statusFor({ cpu: 95, memory: 30, disk: 40 }), 'critical')
})

test('critical takes precedence over warning across metrics', () => {
  assert.equal(statusFor({ cpu: 80, memory: 95, disk: 40 }), 'critical')
})

test('unknown when no metric is available', () => {
  assert.equal(statusFor(null), 'unknown')
})
