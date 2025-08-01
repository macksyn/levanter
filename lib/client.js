const { logger: bh } = require('pino');

console.log = function (...args) {
  const filtered = args.filter(
    arg => !String(arg).includes('pino') && !String(arg).includes('whatsapp-web.js')
  );
  if (filtered.length) {
    bh.info(...filtered);
  }
};

console.warn = function (...args) {
  const filtered = args.filter(
    arg => !String(arg).includes('pino') && !String(arg).includes('whatsapp-web.js')
  );
  if (filtered.length) {
    bh.warn(...filtered);
  }
};

console.error = function (...args) {
  const filtered = args.filter(
    arg => !String(arg).includes('pino') && !String(arg).includes('reconnect') && !String(arg).includes('whatsapp-web.js')
  );
  if (filtered.length) {
    bh.error(...filtered);
  }
};

module.exports = cj; // Assuming cj is the main exported functionality
