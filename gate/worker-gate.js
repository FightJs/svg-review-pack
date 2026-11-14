import cases from './cases.json';
(async()=>{
const results=[];
for (const c of cases) {
  try {
    const actual=await new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('../src/worker.js',import.meta.url),{type:'module'});
      worker.onmessage=e=>{worker.terminate();e.data.error?reject(new Error(e.data.error)):resolve([...new TextEncoder().encode(e.data.data)])};
      worker.onerror=e=>{worker.terminate();reject(new Error(e.message))};
      worker.postMessage({input:c.input,config:c.config});
    });
    results.push({name:c.name,equal:JSON.stringify(actual)===JSON.stringify(c.expected),actual});
  }catch(e){results.push({name:c.name,error:String(e)});}
}
document.body.textContent=JSON.stringify(results);

})().catch(e=>{document.body.textContent=String(e)});
