import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals } from '../server/lib/pricing.js';
import { CONFIG } from '../server/lib/config.js';

test('shipping is charged below the threshold and free above it', () => {
  const low = computeTotals([{ price: 1000, quantity: 1, physical: true }]);
  assert.equal(low.shipping, CONFIG.shippingFee);
  assert.equal(low.total, 1000 + CONFIG.shippingFee);
  assert.equal(low.free_shipping_remaining, CONFIG.freeShippingThreshold - 1000);

  const high = computeTotals([{ price: 1600, quantity: 2, physical: true }]);
  assert.equal(high.shipping, 0);
  assert.equal(high.free_shipping_remaining, 0);
});

test('service-only carts never pay shipping', () => {
  const t = computeTotals([{ price: 500, quantity: 1, physical: false }]);
  assert.equal(t.shipping, 0);
  assert.equal(t.has_physical, false);
  assert.equal(t.total, 500);
});

test('free shipping threshold is measured on physical products only', () => {
  const t = computeTotals([
    { price: 500, quantity: 1, physical: true },
    { price: 9500, quantity: 1, physical: false }
  ]);
  assert.equal(t.shipping, CONFIG.shippingFee);
});

test('rounding is stable', () => {
  const t = computeTotals([{ price: 19.99, quantity: 3, physical: false }]);
  assert.equal(t.subtotal, 59.97);
  assert.equal(t.count, 3);
});

test('coupon discount reduces the total but never below zero; shipping still follows the physical subtotal', () => {
  const t = computeTotals([{ price: 1000, quantity: 1, physical: true }], 150);
  assert.equal(t.discount, 150); assert.equal(t.total, 1000 - 150 + CONFIG.shippingFee);
  assert.equal(computeTotals([{ price: 100, quantity: 1, physical: false }], 999).total, 0);
  assert.equal(computeTotals([{ price: 100, quantity: 1, physical: false }]).discount, 0);
});
