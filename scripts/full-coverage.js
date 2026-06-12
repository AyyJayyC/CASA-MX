const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COVERAGE_DIR = path.resolve(__dirname, '..', '.nyc_output');
const COVERAGE_REPORT_DIR = path.resolve(__dirname, '..', 'coverage', 'merged');

async function main() {
  console.log('=== Full Coverage Pipeline ===\n');

  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  const coverageFiles = fs.readdirSync(COVERAGE_DIR).filter(f => f.endsWith('.json'));
  for (const f of coverageFiles) {
    fs.unlinkSync(path.join(COVERAGE_DIR, f));
  }

  console.log('1/3 Running vitest with istanbul coverage...');
  try {
    execSync('npx vitest run --coverage', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
      timeout: 300000,
    });
  } catch (e) {
    console.log('  Vitest completed (some tests may have failed)');
  }

  const vitestCoverageDir = path.resolve(__dirname, '..', 'coverage');
  const possibleVitestOutputs = [
    path.join(vitestCoverageDir, 'coverage-final.json'),
    path.join(__dirname, '..', 'coverage', 'coverage-final.json'),
  ];

  let vitestCoverageFile = null;
  for (const p of possibleVitestOutputs) {
    if (fs.existsSync(p)) {
      vitestCoverageFile = p;
      break;
    }
  }

  if (vitestCoverageFile) {
    const vitestDest = path.join(COVERAGE_DIR, 'vitest.json');
    fs.copyFileSync(vitestCoverageFile, vitestDest);
    console.log(`  Vitest coverage saved to ${vitestDest}`);
  } else {
    console.log('  Warning: No vitest coverage file found');
    const coverageFiles = fs.readdirSync(vitestCoverageDir, { recursive: true });
    const jsonFile = coverageFiles.find(f => f.endsWith('coverage-final.json'));
    if (jsonFile) {
      const src = path.join(vitestCoverageDir, jsonFile);
      const dest = path.join(COVERAGE_DIR, 'vitest.json');
      fs.copyFileSync(src, dest);
      console.log(`  Found vitest coverage at ${src}`);
    }
  }

  console.log('\n2/3 Collecting E2E coverage via Playwright...');
  try {
    execSync('node scripts/collect-e2e-coverage.js', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      timeout: 300000,
    });
  } catch (e) {
    console.log('  E2E coverage collection had issues (server may not be running)');
  }

  console.log('\n3/3 Generating merged coverage report...');
  if (!fs.existsSync(COVERAGE_REPORT_DIR)) {
    fs.mkdirSync(COVERAGE_REPORT_DIR, { recursive: true });
  }

  try {
    execSync(`npx nyc report --reporter=text --reporter=html --reporter=json-summary --report-dir=${COVERAGE_REPORT_DIR}`, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log(`\n  Merged report generated at: ${COVERAGE_REPORT_DIR}`);
  } catch (e) {
    console.log('  nyc report generation had issues');
  }

  console.log('\n=== Coverage pipeline complete ===');
}

main().catch(console.error);
