async page => {
 const check=(value,message)=>{if(!value)throw new Error(message)};
 const wait=()=>page.waitForFunction(()=>/比较完成|没有检测到差异/.test(document.querySelector('#status').textContent));
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('https://fightjs.github.io/svg-review-pack/');await wait();
 const original=await page.locator('#summary').innerText();check(original.includes('3409 / 16384'),'unexpected default output');
 check((await page.locator('a[href="https://github.com/FightJs/svg-review-pack"]').count())===1,'source link missing');
 await page.screenshot({path:'docs/images/app-full.png',fullPage:true});await page.locator('#result').screenshot({path:'docs/images/example-result.png'});
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10H0z"/></svg>';
 await page.locator('#file').setInputFiles({name:'plain.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
 check(await page.locator('#download').isDisabled(),'old export remains enabled');
 await page.locator('#config').fill('{"floatPrecision":6,"multipass":true}');await page.locator('#run').click();await wait();
 check((await page.locator('#status').innerText()).includes('没有检测到差异'),'zero difference case did not pass');
 const download=page.waitForEvent('download');await page.locator('#download').click();await (await download).saveAs('evidence/live-review-pack.zip');
 await page.locator('#reset').click();await wait();check((await page.locator('#summary').innerText()).includes('3409 / 16384'),'reset failed');
 await page.setViewportSize({width:375,height:812});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile overflow');
 return {original,userAgent:await page.evaluate(()=>navigator.userAgent),url:page.url(),upload:true,stale:true,config:true,download:true,reset:true,mobile:true};
}
