import test from 'node:test'
import assert from 'node:assert/strict'
import { statusFor } from './thresholds.js'

test('passes through a real status value', () => {
  assert.equal(statusFor({ status: 'operational', message: 'ok' }), 'operational')
})

test('passes through degraded and outage the same way', () => {
  assert.equal(statusFor({ status: 'degraded' }), 'degraded')
  assert.equal(statusFor({ status: 'outage' }), 'outage')
})

test('falls back to unknown when metric has no status', () => {
  assert.equal(statusFor({}), 'unknown')
})

test('unknown when no metric is available at all', () => {
  assert.equal(statusFor(null), 'unknown')
})
