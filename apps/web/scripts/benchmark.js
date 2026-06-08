import Benchmark from 'benchmark';
import { writeFileSync } from 'fs';

const suite = new Benchmark.Suite();
const results = [];

suite
  .add('JSON.stringify#small', () => {
    JSON.stringify({ id: 1, name: 'test', email: 'test@example.com' });
  })
  .add('JSON.stringify#large', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `property-${i}`,
      price: 1000000 + i * 50000,
      city: 'Hermosillo',
      estado: 'Sonora',
      features: ['garage', 'pool', 'garden', 'security'],
    }));
    JSON.stringify(data);
  })
  .add('JSON.parse#small', () => {
    JSON.parse('{"id":1,"name":"test","email":"test@example.com"}');
  })
  .add('JSON.parse#large', () => {
    const str = JSON.stringify(
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `property-${i}`,
        price: 1000000 + i * 50000,
      }))
    );
    JSON.parse(str);
  })
  .add('Array#filter', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr.filter((n) => n % 2 === 0);
  })
  .add('Array#map', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr.map((n) => n * 2);
  })
  .add('Array#reduce', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    arr.reduce((acc, n) => acc + n, 0);
  })
  .add('Object#keys', () => {
    const obj = Object.fromEntries(
      Array.from({ length: 50 }, (_, i) => [`key${i}`, i])
    );
    Object.keys(obj);
  })
  .add('RegExp#test', () => {
    const email = 'usuario.test@casa-mx.com';
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  })
  .on('cycle', (event) => {
    results.push({
      name: event.target.name,
      hz: event.target.hz,
      rme: event.target.stats.rme,
      samples: event.target.stats.sample.length,
    });
  })
  .on('complete', () => {
    const output = {
      date: new Date().toISOString(),
      results: results.map((r) => ({
        name: r.name,
        opsPerSec: Math.round(r.hz),
        marginOfError: `\u00B1${r.rme.toFixed(2)}%`,
        samples: r.samples,
      })),
    };
    writeFileSync('benchmark-result.json', JSON.stringify(output, null, 2));
    console.log('Benchmark complete. Results written to benchmark-result.json');
  })
  .run({ async: true });
