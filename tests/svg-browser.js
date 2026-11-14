import { validateSvg } from '../src/svg.js';
const enc = new TextEncoder();
const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${body}</svg>`;
const valid = wrap('<path d="M0 0L9 9" fill="réḍ"/>');
const invalid = [
 ['BOM','\ufeff'+valid], ['malformed',wrap('<path>')], ['doctype','<!DOCTYPE svg>'+valid], ['script',wrap('<script/>')], ['style',wrap('<path style="fill:red"/>')], ['url',wrap('<path fill="url(https://example.com/a)"/>')], ['unknown attribute',wrap('<path onclick="alert(1)"/>')], ['unknown element',wrap('<use/>')], ['constructor element',wrap('<constructor/>')], ['toString element',wrap('<toString/>')], ['__proto__ element',wrap('<__proto__/>')], ['nested svg',wrap('<svg/>')], ['wrong namespace',valid.replace('http://www.w3.org/2000/svg','https://example.com')], ['bad viewBox',valid.replace('0 0 10 10','0 0 0 10')], ['NBSP viewBox',valid.replace('0 0 10 10','0\u00a00\u00a010\u00a010')], ['double comma viewBox',valid.replace('0 0 10 10','0,,0,10,10')], ['leading comma viewBox',valid.replace('0 0 10 10',',0 0 10 10')], ['trailing comma viewBox',valid.replace('0 0 10 10','0 0 10 10,')], ['too many',wrap('<path/>'.repeat(301))], ['too deep',wrap('<g>'.repeat(21)+'</g>'.repeat(21))], ['long path',wrap('<path d="'+ 'M'.repeat(8193)+'"/>')], ['padded long path',wrap('<path d="'+ ' '.repeat(8193)+'M0 0"/>')], ['too large',wrap(' '.repeat(65537))]
];
const results=[];
try {validateSvg(enc.encode(valid.replace('0 0 10 10','0, 0 10,10')));results.push({case:'valid mixed separators',pass:true});}catch(e){results.push({case:'valid mixed separators',pass:false,error:e.message});}
try { validateSvg(enc.encode(valid)); results.push({case:'valid Unicode attribute',pass:true}); } catch(e) {results.push({case:'valid Unicode attribute',pass:false,error:e.message});}
for (const [name,text] of invalid) {try {validateSvg(enc.encode(text));results.push({case:name,pass:false});}catch(e){results.push({case:name,pass:true});}}
try {validateSvg(new Uint8Array([0xff]));results.push({case:'invalid UTF-8',pass:false});}catch(e){results.push({case:'invalid UTF-8',pass:true});}
document.body.textContent=JSON.stringify(results);
