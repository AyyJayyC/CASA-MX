module.exports = {
  name: 'noop',
  track: async () => Promise.resolve({ ok: true }),
  flush: async () => Promise.resolve()
};
