const [major] = process.versions.node.split('.').map(Number);

if (major < 18) {
  console.error(`\n❌ Unsupported Node.js version: ${process.versions.node}`);
  console.error('Casa MX requires Node.js 18.x or later.');
  console.error('Please switch Node version and try again.\n');
  process.exit(1);
}
