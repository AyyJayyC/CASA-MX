module.exports = {
  name: 'console',
  track: async (payload) => {
    // Keep a concise, structured log for local dev
    console.info('[analytics][console] track', payload);
    return Promise.resolve({ ok: true });
  },
  flush: async () => Promise.resolve()
};
