import './style.css';
import pixelmatch from 'pixelmatch';
import JSZip from 'jszip';
import { effectiveConfig } from './config.js';
import { validateSvg, renderSvg } from './svg.js';
import packageJson from '../package.json?raw';
import packageLock from '../package-lock.json?raw';
import verifyScript from '../verify.mjs?raw';

const example = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#2456e8" transform="rotate(40)" transform-origin="50 50" d="M20 25h60v18H20z"/></svg>';
const defaultConfig = '{ "floatPrecision": 3, "multipass": false }';
/** @param {string} id @returns {HTMLInputElement & HTMLTextAreaElement & HTMLButtonElement} */
const $ = id => /** @type {HTMLInputElement & HTMLTextAreaElement & HTMLButtonElement} */ (document.getElementById(id));
const enc = new TextEncoder();
let input=enc.encode(example), filename='原创 transform-origin 示例', generation=0, result=null, cancelWorker=null;
function status(message,error=false) { $('status').textContent=message; $('status').className=error?'error':''; }
function stale() { generation++; if(cancelWorker) cancelWorker(); cancelWorker=null;result=null;$('download').disabled=true;$('result').hidden=true;status('输入或配置已更改，请重新优化。'); }
function workerOptimize(text,config) {
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
    const finish=(err,data)=>{clearTimeout(timer);worker.terminate();cancelWorker=null;err?reject(new Error(err)):resolve(data);};
    const timer=setTimeout(()=>finish('优化超时，请尝试更简单的文件'),10000);
    cancelWorker=()=>finish('已取消过期任务');
    worker.onmessage=e=>finish(e.data.error,e.data.data);worker.onerror=()=>finish('优化器运行失败');
    worker.postMessage({input:text,config});
  });
}
async function run() {
  stale(); const current=generation; status('正在校验、优化并渲染…');
  try {
    if (!input) throw new Error('请选择有效的 SVG 文件');
    const config=effectiveConfig($('config').value), original=validateSvg(input);
    const optimized=await workerOptimize(original.text,config);if(current!==generation)return;
    let candidate;try {candidate=validateSvg(enc.encode(optimized));}catch(e){throw new Error(`优化结果不受支持：${e.message}`);}
    const [before,after]=await Promise.all([renderSvg(original),renderSvg(candidate)]);if(current!==generation)return;
    const diff=document.createElement('canvas');diff.width=128;diff.height=128;
    const a=before.getContext('2d').getImageData(0,0,128,128),b=after.getContext('2d').getImageData(0,0,128,128),context=diff.getContext('2d'),d=context.createImageData(128,128);
    const pixels=pixelmatch(a.data,b.data,d.data,128,128,{threshold:0.1,includeAA:true});context.putImageData(d,0,0);
    const configText=JSON.stringify(config,null,2)+'\n';
    result={input:input.slice(),optimized,configText,before,after,diff,pixels,filename,browser:navigator.userAgent};
    for(const [id,canvas,label] of /** @type {[string, HTMLCanvasElement, string][]} */ ([['before',before,'原图预览，128 × 128 像素'],['after',after,'优化图预览，128 × 128 像素'],['diff',diff,`像素差异图，${pixels} 个不同像素`]])) { canvas.setAttribute('role','img'); canvas.setAttribute('aria-label',label); $(id).replaceChildren(canvas); }
    $('summary').textContent=`原图 ${input.byteLength} 字节 → 优化图 ${enc.encode(optimized).length} 字节 · 差异像素 ${pixels} / 16384`;
    $('details').textContent=`${navigator.userAgent}\n\n${configText}`;
    $('result').hidden=false;$('download').disabled=false;
    status(pixels ? '比较完成。差异仅反映当前渲染条件。' : '在本尺寸、背景和阈值下没有检测到差异。');
  } catch(e) {if(current===generation){result=null;$('download').disabled=true;$('result').hidden=true;status(e.message||'处理失败',true);}}
}
async function choose(file) {
  $('file').value='';
  stale();const current=generation;input=null;filename='';$('filename').textContent='';
  if(!file){status('请选择一张 SVG 文件',true);return;}
  if(file.size>65536){status('文件超过 64 KiB',true);return;}
  try {const bytes=new Uint8Array(await file.arrayBuffer());if(current!==generation)return;input=bytes;filename=file.name;$('filename').textContent=filename;status('已载入文件，请优化并比较。');}catch{if(current===generation)status('读取文件失败',true);}
}
const hex=async bytes=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const png=canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG 生成失败')),'image/png'));
async function download() {
  if(!result)return;const r=result,current=generation;$('download').disabled=true;
  try {
    const config=enc.encode(r.configText),output=enc.encode(r.optimized);
    const manifest={formatVersion:1,svgo:'4.1.0',pixelmatch:{version:'8.0.0',threshold:0.1,includeAA:true},render:{width:128,height:128,background:'#ffffff',browser:r.browser},differentPixels:r.pixels,sha256:{'input.svg':await hex(r.input),'effective-config.json':await hex(config),'optimized.svg':await hex(output)}};
    const images=await Promise.all([png(r.before),png(r.after),png(r.diff)]);if(current!==generation)return;
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width"><title>SVG Review Report</title><style>body{font:16px/1.5 system-ui;max-width:900px;margin:2rem auto;padding:0 1rem;color:#182338}section{display:flex;gap:1rem;flex-wrap:wrap}figure{margin:0}img{width:128px;height:128px;border:1px solid #ccd3df}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f3f5f8;padding:1rem}</style></head><body><h1>SVG Review Report</h1><p>Source: ${escapeHtml(r.filename)} · Different pixels: ${r.pixels} / 16384</p><p>Observation at 128 × 128, white background, pixelmatch 0.1, includeAA true. This report does not perform verification or establish equivalence or authenticity.</p><section>${['Before','After','Difference'].map((name,i)=>`<figure><figcaption>${name}</figcaption><img alt="${name}" src="${[r.before,r.after,r.diff][i].toDataURL('image/png')}"></figure>`).join('')}</section><h2>Manifest</h2><pre>${escapeHtml(JSON.stringify(manifest,null,2))}</pre><h2>Effective configuration</h2><pre>${escapeHtml(r.configText)}</pre><p>To rerun, extract the ZIP and use npm ci --ignore-scripts followed by node verify.mjs. Installation usually requires network access.</p></body></html>`;
    const zip=new JSZip();zip.file('input.svg',r.input);zip.file('effective-config.json',config);zip.file('optimized.svg',output);zip.file('manifest.json',JSON.stringify(manifest,null,2)+'\n');
    ['before.png','after.png','diff.png'].forEach((name,i)=>zip.file(name,images[i]));zip.file('report.html',html);zip.file('verify.mjs',verifyScript);zip.file('package.json',packageJson);zip.file('package-lock.json',packageLock);
    const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});if(current!==generation)return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='svg-review-pack.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('审阅包已生成。接收者仍需运行校验脚本。');
  } catch(e){if(current===generation)status(`导出失败：${e.message}`,true);} finally {if(current===generation && result)$('download').disabled=false;}
}
$('config').addEventListener('input',stale);$('file').addEventListener('change',e=>choose((/** @type {HTMLInputElement} */ (e.target)).files[0]));$('run').addEventListener('click',run);$('download').addEventListener('click',download);
$('reset').addEventListener('click',()=>{stale();input=enc.encode(example);filename='原创 transform-origin 示例';$('filename').textContent=filename;$('file').value='';$('config').value=defaultConfig;run();});
for(const event of ['dragenter','dragover']) $('drop').addEventListener(event,e=>{e.preventDefault();$('drop').classList.add('drag');});
for(const event of ['dragleave','drop']) $('drop').addEventListener(event,e=>{e.preventDefault();$('drop').classList.remove('drag');if(event==='drop'){if((/** @type {DragEvent} */ (e)).dataTransfer.files.length!==1){stale();input=null;filename='';$('filename').textContent='';status('请拖入且仅拖入一张文件',true);}else choose((/** @type {DragEvent} */ (e)).dataTransfer.files[0]);}});
$('filename').textContent=filename;run();
