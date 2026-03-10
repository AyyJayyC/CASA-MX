const { spawn } = require('child_process');

const defaultTimeoutMs = 120000;
const timeoutMs = Number(process.env.TEST_TIMEOUT_MS || defaultTimeoutMs);

const args = process.argv.slice(2);
const command = args[0] || 'vitest';
const commandArgs = args.length > 1 ? args.slice(1) : ['run'];

let child;
if (process.platform === 'win32') {
  const resolvedCommand = /\.(cmd|exe|bat)$/i.test(command) ? command : `${command}.cmd`;
  child = spawn('cmd.exe', ['/c', resolvedCommand, ...commandArgs], {
    stdio: 'inherit',
    shell: false,
  });
} else {
  child = spawn(command, commandArgs, {
    stdio: 'inherit',
    shell: false,
  });
}

const timeout = setTimeout(() => {
  console.error(`\nTest run timed out after ${timeoutMs}ms. Terminating process...`);
  child.kill('SIGTERM');

  setTimeout(() => {
    if (!child.killed) {
      console.error('Force killing test process...');
      child.kill('SIGKILL');
    }
  }, 5000);
}, timeoutMs);

child.on('exit', (code, signal) => {
  clearTimeout(timeout);
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  clearTimeout(timeout);
  console.error('Failed to start test process:', err.message);
  process.exit(1);
});
