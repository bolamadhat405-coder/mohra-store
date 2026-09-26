// Business rules in ONE place. The frontend reads them from /api/config,
// so the cart, checkout, AI assistant and server can never disagree.
const num = (v, d) => (v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d);

export const CONFIG = {
  currency: 'EGP',
  freeShippingThreshold: num(process.env.FREE_SHIPPING_THRESHOLD, 3000),
  shippingFee: num(process.env.SHIPPING_FEE, 80),
  maxQty: 20,
  lowStock: 5,
  paymentMethods: ['whatsapp']
};

export const publicConfig = () => ({
  currency: CONFIG.currency,
  free_shipping_threshold: CONFIG.freeShippingThreshold,
  shipping_fee: CONFIG.shippingFee,
  max_qty: CONFIG.maxQty,
  low_stock: CONFIG.lowStock,
  payment_methods: CONFIG.paymentMethods
});

// BOLA TECH Store-only checkout: every order is sent to the configured WhatsApp number.
export const paymentMethods = (site = {}) => ['whatsapp'];
