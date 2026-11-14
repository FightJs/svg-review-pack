const NS = 'http://www.w3.org/2000/svg';
const common = ['fill','fill-opacity','fill-rule','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','opacity','transform','transform-origin'];
const attrs = {
  svg:['xmlns','viewBox','width','height'],
  g:[], path:['d'], rect:['x','y','width','height','rx','ry'], circle:['cx','cy','r'],
  ellipse:['cx','cy','rx','ry'], line:['x1','y1','x2','y2'], polyline:['points'], polygon:['points']
};
const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const nums = /^[\d\s,\.eE+\-]+$/;
const color = /^(?:#[\da-fA-F]{3,8}|[\p{L}][\p{L}\p{N}-]*)$/u;
const transform = /^(?:(?:matrix|translate|scale|rotate|skewX|skewY)\s*\([\d\s,\.eE+\-]+\)\s*)+$/;
const err = message => { throw new Error(`不支持的 SVG：${message}`); };
export function validateSvg(bytes) {
  if (bytes.byteLength > 65536) err('超过 64 KiB');
  if (bytes[0]===0xef && bytes[1]===0xbb && bytes[2]===0xbf) err('不接受 UTF-8 BOM');
  let text;
  try { text = new TextDecoder('utf-8',{fatal:true}).decode(bytes); } catch { err('不是有效的 UTF-8'); }
  if (/<!\s*(?:DOCTYPE|ENTITY)/i.test(text)) err('不允许 DOCTYPE 或 ENTITY');
  const doc = new DOMParser().parseFromString(text,'image/svg+xml');
  if (doc.querySelector('parsererror')) err('XML 格式无效');
  const root = doc.documentElement;
  if (!root || root.localName !== 'svg' || root.namespaceURI !== NS) err('根元素必须是 SVG 命名空间中的 svg');
  for (const node of doc.childNodes) if (node !== root && node.nodeType !== Node.COMMENT_NODE) err('根元素外存在不支持的内容');
  const viewBox = (root.getAttribute('viewBox') || '').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, '');
  if (/^,|,$|,[ \t\r\n]*,/.test(viewBox)) err('viewBox 无效');
  const vb = viewBox.split(/[ \t\r\n,]+/);
  if (vb.length !== 4 || vb.some(x=>!number.test(x) || !Number.isFinite(Number(x))) || Number(vb[2])<=0 || Number(vb[3])<=0) err('viewBox 无效');
  let count = 0;
  function visit(el,depth) {
    if (++count>300 || depth>20) err('元素数量或嵌套深度超限');
    if (el.namespaceURI!==NS || !Object.hasOwn(attrs, el.localName) || (el!==root && el.localName==='svg')) err(`元素 ${el.tagName}`);
    for (const attr of el.attributes) {
      const name=attr.name, value=attr.value.trim();
      if (!(attrs[el.localName].includes(name) || common.includes(name)) || (attr.namespaceURI && name!=='xmlns')) err(`属性 ${name}`);
      if (name==='xmlns') { if(el!==root || value!==NS) err('命名空间'); continue; }
      if (name==='viewBox') continue;
      if (name==='d') { if (attr.value.length>8192 || (value && !/^[MmZzLlHhVvCcSsQqTtAa\d\s,\.eE+\-]+$/.test(value))) err('path d 无效或超限'); continue; }
      if (name==='transform') {if (value && !transform.test(value)) err('transform 无效'); continue;}
      if (name==='transform-origin') {if (!/^[\w\s.%+\-]+$/.test(value)) err('transform-origin 无效'); continue;}
      if (name==='fill' || name==='stroke') {if (!color.test(value)) err(`${name} 颜色无效`); continue;}
      if (['fill-rule','stroke-linecap','stroke-linejoin'].includes(name)) {if (!/^[a-z-]+$/.test(value)) err(`${name} 无效`); continue;}
      if (name==='points' || name==='stroke-dasharray') {if (value!=='none' && (!value || !nums.test(value))) err(`${name} 无效`); continue;}
      if (!number.test(value) || !Number.isFinite(Number(value))) err(`${name} 必须是有限数值`);
    }
    for (const node of el.childNodes) {
      if (node.nodeType===Node.ELEMENT_NODE) visit(node,depth+1);
      else if (node.nodeType===Node.TEXT_NODE && !node.textContent.trim()) continue;
      else if (node.nodeType===Node.COMMENT_NODE) continue;
      else err('不支持文本、处理指令或其他节点');
    }
  }
  visit(root,1);
  return {text,doc,viewBox:vb.map(Number)};
}
export async function renderSvg(validated) {
  const root=validated.doc.documentElement.cloneNode(true);
  root.setAttribute('width','128'); root.setAttribute('height','128'); root.setAttribute('preserveAspectRatio','xMidYMid meet');
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'}));
  try {
    const image=new Image();
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error('SVG 图片渲染失败'));image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx) throw new Error('Canvas 不可用');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,128,128);ctx.drawImage(image,0,0,128,128);
    return canvas;
  } finally {URL.revokeObjectURL(url);}
}
