async page => {
 const requests=[];page.on('request',r=>requests.push(r.url()));
 await page.goto('http://127.0.0.1:4181/svg-review-pack/');
 await page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 const summary=await page.locator('#summary').innerText();
 if(!summary.includes('3409 / 16384'))throw new Error('Unexpected result: '+summary);
 await page.locator('#config').fill('{"floatPrecision":6,"multipass":true}');
 if(!(await page.locator('#download').isDisabled()))throw new Error('Stale download enabled');
 await page.locator('#run').click();
 await page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 if(!(await page.locator('#download').isEnabled()))throw new Error('No export');
 const download=page.waitForEvent('download');await page.locator('#download').click();await (await download).saveAs('evidence/subpath-review-pack.zip');
 return {summary,requests};
}
