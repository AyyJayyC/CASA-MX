import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextConfig = require('../../next.config.js');

describe('next.config image remotePatterns', () => {
  const hostnames = nextConfig.images.remotePatterns.map((p) => p.hostname);

  it('allows property photos served from i.beemaps.com.mx', () => {
    expect(hostnames).toContain('i.beemaps.com.mx');
  });

  it('does not include the invalid mid-host S3 wildcard', () => {
    expect(hostnames).not.toContain('*.s3.*.amazonaws.com');
    expect(hostnames).toContain('*.s3.amazonaws.com');
  });

  it('allows R2 property image hosts', () => {
    expect(hostnames).toContain('**.r2.dev');
    expect(hostnames).toContain('images.casa-mx.com');
  });
});
