async page => {
 await page.setViewportSize({width:1440,height:1100});
 await page.goto('http://127.0.0.1:4180/');
 await page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 const summary=await page.locator('#summary').innerText();
 if(!summary.includes('3409 / 16384'))throw new Error('Unexpected result: '+summary);
 await page.screenshot({path:'docs/images/app-full.png',fullPage:true});
 await page.locator('#result').screenshot({path:'docs/images/example-result.png'});
 return {summary,render:await page.locator('#result').innerText(),userAgent:await page.evaluate(()=>navigator.userAgent)};
}
