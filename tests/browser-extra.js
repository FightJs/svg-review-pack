async page => {
 const expect=(v,m)=>{if(!v)throw new Error(m)};
 const wait=()=>page.waitForFunction(()=>{const s=document.querySelector('#status');return s.classList.contains('error') || /比较完成|没有检测到差异/.test(s.textContent)});
 await page.goto('http://127.0.0.1:4178/');await wait();
 await page.evaluate(()=>{const dt=new DataTransfer();dt.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>'],'drag.svg',{type:'image/svg+xml'}));document.querySelector('#drop').dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:dt}));});
 await page.waitForFunction(()=>document.querySelector('#filename').textContent==='drag.svg');
 expect(await page.locator('#download').isDisabled(),'drag did not invalidate');await page.locator('#run').click();await wait();expect(!(await page.locator('#status').getAttribute('class')),'drag optimize failed');
 await page.setViewportSize({width:375,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
 await page.locator('#reset').focus();await page.keyboard.press('Enter');await wait();expect(await page.locator('#download').isEnabled(),'keyboard activation failed');
 await page.locator('#config').fill('{}');
 await page.evaluate(()=>{window.Worker=class {postMessage(){queueMicrotask(()=>this.onmessage({data:{error:'forced optimizer failure'}}))}terminate(){}}});
 await page.locator('#run').click();await wait();expect((await page.locator('#status').textContent()).includes('forced optimizer failure'),'optimizer failure not surfaced');expect(await page.locator('#download').isDisabled(),'export after optimizer failure');
 await page.reload();await wait();
 await page.evaluate(()=>{window.Worker=class {postMessage(){queueMicrotask(()=>this.onmessage({data:{data:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><use/></svg>'}}))}terminate(){}}});
 await page.locator('#run').click();await wait();expect((await page.locator('#status').textContent()).includes('优化结果不受支持'),'unsupported output not rejected');expect(await page.locator('#download').isDisabled(),'export after unsupported output');
 await page.reload();await wait();
 await page.locator('#config').fill('<img src=x onerror=alert(1)>');await page.locator('#run').click();await wait();expect((await page.locator('#status').textContent()).includes('JSON'),'invalid HTML config accepted');expect(await page.locator('img').count()===0,'HTML config executed');
 await page.reload();await wait();
 await page.evaluate(()=>{window.Image=class {set src(v){queueMicrotask(()=>this.onerror())}}});
 await page.locator('#run').click();await wait();expect((await page.locator('#status').textContent()).includes('渲染失败'),'render error not surfaced');expect(await page.locator('#download').isDisabled(),'export after render failure');
 await page.reload();await wait();
 const evil='"><img src=x onerror=alert(1)>.svg';
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>';
 await page.locator('#file').setInputFiles({name:evil,mimeType:'image/svg+xml',buffer:Buffer.from(svg)});await page.locator('#run').click();await wait();
 const dl=page.waitForEvent('download');await page.locator('#download').click();const download=await dl;await download.saveAs('evidence/escaped-name.zip');
 return 'drag, narrow screen, keyboard focus, optimizer/render failures and escaped-name export passed';
}
