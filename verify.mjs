import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const fail = message => { throw new Error(message); };
try {
  const require = createRequire(import.meta.url);
  let optimize, version;
  try { ({ optimize } = await import('svgo')); version = JSON.parse(await readFile(join(dirname(require.resolve('svgo')),'..','package.json'),'utf8')).version; }
  catch { fail('Missing SVGO dependency. Run npm ci --ignore-scripts first.'); }
  const manifest = JSON.parse(await readFile('manifest.json','utf8'));
  if (version !== '4.1.0' || manifest.svgo !== '4.1.0') fail(`SVGO version mismatch: installed ${version}, manifest ${manifest.svgo}`);
  const files = {};
  for (const name of ['input.svg','effective-config.json','optimized.svg']) {
    files[name] = await readFile(name);
    const actual = createHash('sha256').update(files[name]).digest('hex');
    if (actual !== manifest.sha256?.[name]) fail(`SHA-256 mismatch: ${name}`);
  }
  const config = JSON.parse(files['effective-config.json'].toString('utf8'));
  const keys = (v, list) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).sort().join(',') === [...list].sort().join(',');
  if (!keys(config,['path','plugins','floatPrecision','multipass','js2svg']) || config.path !== 'input.svg' || JSON.stringify(config.plugins)!=='["preset-default"]' || !Number.isInteger(config.floatPrecision) || config.floatPrecision < 0 || config.floatPrecision > 6 || typeof config.multipass !== 'boolean' || !keys(config.js2svg,['eol','pretty']) || config.js2svg.eol !== 'lf' || config.js2svg.pretty !== false) fail('Unsupported effective configuration');
  const input = new TextDecoder('utf-8',{fatal:true}).decode(files['input.svg']);
  const output = Buffer.from(optimize(input,config).data,'utf8');
  if (!output.equals(files['optimized.svg'])) fail('Reoptimized bytes do not match optimized.svg');
  console.log('PASS: hashes and reoptimized bytes match. This does not authenticate the files or prove visual equivalence.');
} catch (error) { console.error(`FAIL: ${error.message}`); process.exitCode = 1; }
