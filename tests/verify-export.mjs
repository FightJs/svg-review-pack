import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
const dir=await mkdtemp(join(tmpdir(),'svg-review-real-'));
const run=(program,args)=>spawnSync(program,args,{cwd:dir,encoding:'utf8'});
const assert=(ok,message)=>{if(!ok)throw new Error(message)};
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
try {
 const unzip=run('unzip',['-q',resolve('evidence/example-review-pack.zip')]);assert(unzip.status===0,unzip.stderr);
 assert((await readFile(join(dir,'package-lock.json'))).equals(await readFile('package-lock.json')),'export lock differs from build lock');
 let r=run(process.execPath,['verify.mjs']);assert(r.status!==0 && r.stderr.includes('npm ci --ignore-scripts'),'missing dependency');console.log('PASS missing dependency: nonzero and install hint');
 r=run('npm',['ci','--ignore-scripts']);assert(r.status===0,r.stderr);console.log('PASS npm ci --ignore-scripts');
 r=run(process.execPath,['verify.mjs']);assert(r.status===0,r.stderr);console.log('PASS intact export: '+r.stdout.trim());
 for (const name of ['input.svg','effective-config.json','optimized.svg']) {
   const path=join(dir,name),original=await readFile(path);await writeFile(path,Buffer.concat([original,Buffer.from('x')]));
   r=run(process.execPath,['verify.mjs']);assert(r.status!==0 && r.stderr.includes('mismatch'),name+' did not fail');console.log('PASS tamper '+name+': '+r.stderr.trim());await writeFile(path,original);
 }
 const manifestPath=join(dir,'manifest.json'),manifestOriginal=await readFile(manifestPath),manifest=JSON.parse(manifestOriginal);
 await writeFile(manifestPath,JSON.stringify({...manifest,svgo:'0.0.0'}));r=run(process.execPath,['verify.mjs']);assert(r.status!==0 && r.stderr.includes('version mismatch'),'version did not fail');console.log('PASS tamper version: '+r.stderr.trim());
 const optimizedPath=join(dir,'optimized.svg'),optimized=await readFile(optimizedPath),changed=Buffer.concat([optimized,Buffer.from(' ')]);
 await writeFile(optimizedPath,changed);manifest.sha256['optimized.svg']=hash(changed);await writeFile(manifestPath,JSON.stringify(manifest));
 r=run(process.execPath,['verify.mjs']);assert(r.status!==0 && r.stderr.includes('Reoptimized bytes'),'reoptimization mismatch not detected');console.log('PASS changed candidate plus matching hash: '+r.stderr.trim());
 await rm(join(dir,'input.svg'));r=run(process.execPath,['verify.mjs']);assert(r.status!==0,'missing input did not fail');console.log('PASS missing file: '+r.stderr.trim());
} finally {await rm(dir,{recursive:true,force:true});}
