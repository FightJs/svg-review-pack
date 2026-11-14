import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { optimize } from 'svgo';
const hash=x=>createHash('sha256').update(x).digest('hex');
test('verify succeeds for an untampered package and rejects modified files and version',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'svg-verify-'));
 try {
  await symlink(resolve('node_modules'),join(dir,'node_modules'),'dir');
  await writeFile(join(dir,'verify.mjs'),await readFile('verify.mjs'));
  const input='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0L9 9"/></svg>';
  const config=JSON.stringify({path:'input.svg',plugins:['preset-default'],floatPrecision:3,multipass:false,js2svg:{eol:'lf',pretty:false}},null,2)+'\n';
  const output=optimize(input,JSON.parse(config)).data;
  const manifest={svgo:'4.1.0',sha256:{'input.svg':hash(input),'effective-config.json':hash(config),'optimized.svg':hash(output)}};
  const files={'input.svg':input,'effective-config.json':config,'optimized.svg':output,'manifest.json':JSON.stringify(manifest)};
  for(const [name,data] of Object.entries(files)) await writeFile(join(dir,name),data);
  const run=()=>spawnSync(process.execPath,['verify.mjs'],{cwd:dir,encoding:'utf8'});
  assert.equal(run().status,0,'untampered files must pass');
  for(const name of ['input.svg','effective-config.json','optimized.svg']) {await writeFile(join(dir,name),files[name]+'x');assert.notEqual(run().status,0,name+' tampering');await writeFile(join(dir,name),files[name]);}
  await writeFile(join(dir,'manifest.json'),JSON.stringify({...manifest,svgo:'0.0.0'})); assert.notEqual(run().status,0,'version mismatch');
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test('missing dependencies produce a clear nonzero error',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'svg-missing-'));
 try {await writeFile(join(dir,'verify.mjs'),await readFile('verify.mjs'));const r=spawnSync(process.execPath,['verify.mjs'],{cwd:dir,encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/npm ci --ignore-scripts/);} finally {await rm(dir,{recursive:true,force:true});}
});
