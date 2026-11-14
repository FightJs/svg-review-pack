async page => {
 const check=(v,m)=>{if(!v)throw new Error(m)};
 const a='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
 await page.goto('http://127.0.0.1:4179/');
 await page.waitForFunction(()=>document.querySelector('#result')&&!document.querySelector('#result').hidden);
 check(await page.locator('#config').getAttribute('aria-describedby')==='config-help','configuration help not associated');
 for(const id of ['before','after','diff'])check(await page.locator('#'+id+' canvas').getAttribute('aria-label'),'canvas lacks accessible label: '+id);
 await page.locator('#file').setInputFiles({name:'a.svg',mimeType:'image/svg+xml',buffer:Buffer.from(a)});
 await page.evaluate((svg)=>{let d=new DataTransfer();d.items.add(new File([svg],'b.svg',{type:'image/svg+xml'}));document.querySelector('#drop').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:d}));},a);
 await page.waitForFunction(()=>document.querySelector('#filename').textContent==='b.svg');
 await page.locator('#file').setInputFiles({name:'a.svg',mimeType:'image/svg+xml',buffer:Buffer.from(a)});
 await page.waitForTimeout(100);
 check((await page.locator('#filename').innerText())==='a.svg','same selected file not restored after drag');
 return 'Accessible names and repeated selection after drag passed';
}
