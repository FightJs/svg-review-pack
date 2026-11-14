import { optimize } from 'svgo';
import { writeFileSync } from 'node:fs';
const inputs = [
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="red" d="M1 1L20 1L20 20Z"/></svg>',
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\r\n<rect width="10" height="12" fill="blue"/>\r\n</svg>',
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="réḍ" d="M1 1L20 1L20 20Z"/></svg>'
];
const cases = inputs.flatMap((input,i)=>[false,true].flatMap(multipass=>[0,6].map(floatPrecision=>({name:`input${i}-multipass${multipass}-precision${floatPrecision}`,input,config:{path:'input.svg',plugins:['preset-default'],floatPrecision,multipass,js2svg:{eol:'lf',pretty:false}}}))));
for (const c of cases) c.expected = [...new TextEncoder().encode(optimize(c.input,c.config).data)];
writeFileSync(new URL('./cases.json', import.meta.url), JSON.stringify(cases));
