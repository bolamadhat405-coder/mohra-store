import { CONFIG } from './config.js';

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// lines: [{ price, quantity, physical }]  ->  totals used by BOTH the cart view and order creation.
// Shipping only applies when the order contains physical products, and the
// free-shipping threshold is measured on the physical products only (before any coupon).
export function computeTotals(lines, discount = 0) {
  let subtotal = 0;
  let physicalSubtotal = 0;
  let hasPhysical = false;
  let count = 0;
  for (const l of lines) {
    const amount = Number(l.price) * Number(l.quantity);
    subtotal += amount;
    count += Number(l.quantity);
    if (l.physical) {
      hasPhysical = true;
      physicalSubtotal += amount;
    }
  }
  const needsShipping = hasPhysical && physicalSubtotal < CONFIG.freeShippingThreshold;
  const shipping = needsShipping ? CONFIG.shippingFee : 0;
  const off = Math.min(round2(Math.max(0, Number(discount) || 0)), round2(subtotal));
  return {
    subtotal: round2(subtotal),
    discount: off,
    shipping: round2(shipping),
    total: round2(subtotal - off + shipping),
    has_physical: hasPhysical,
    count,
    free_shipping_remaining: needsShipping ? round2(CONFIG.freeShippingThreshold - physicalSubtotal) : 0
  };
}
