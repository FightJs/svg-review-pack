async page => {
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('http://127.0.0.1:4180/');
 await page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 const summary=await page.locator('#summary').textContent();
 if(!summary.includes('3409 / 16384'))throw new Error('Unexpected example pixels: '+summary);
 const downloadPromise=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadPromise;await download.saveAs('evidence/example-review-pack.zip');
 if(requests.some(url=>url.startsWith('http')&&!url.startsWith('http://127.0.0.1:4180/')))throw new Error('External request: '+requests.join(','));
 return {summary,requests};
}
