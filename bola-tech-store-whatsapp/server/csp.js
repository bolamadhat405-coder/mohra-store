// Content-Security-Policy. The frontend uses NO inline scripts and NO inline event handlers,
// so scripts are limited to our own files. That neutralises most XSS attempts.
export const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  scriptSrcAttr: ["'none'"],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  imgSrc: ["'self'", 'data:', 'https:'],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'self'"],
  frameSrc: ["'self'", 'https:'],
  mediaSrc: ["'self'", 'https:', 'blob:']
};
